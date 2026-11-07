
import Purchase from "../models/Purchase.js";
import Supplier from "../models/Supplier.js";
import Department from "../models/Department.js";

// Check whether the logged-in user is an admin
const isAdmin = (req) => {
  return req.user?.role === "admin";
};

// Get the logged-in user's assigned department ID
const getAssignedDepartmentId = (req) => {
  const department =
    req.user?.department?._id ||
    req.user?.department ||
    req.user?.departmentId;

  return department ? String(department) : null;
};

// Get department filter for purchase queries
const getDepartmentScope = (req) => {
  if (isAdmin(req)) {
    return {};
  }

  const departmentId = getAssignedDepartmentId(req);

  if (!departmentId) {
    return null;
  }

  return { department: departmentId };
};

// Generate sequential purchase number
const generatePurchaseNo = async () => {
  const lastPurchase = await Purchase.findOne()
    .sort({ createdAt: -1 })
    .select("purchaseNo");

  let nextNumber = 1;

  if (lastPurchase?.purchaseNo) {
    const match = lastPurchase.purchaseNo.match(/(\d+)$/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  return `PUR-${String(nextNumber).padStart(4, "0")}`;
};

// Calculate purchase item totals and overall totals
const calculateItems = (items) => {
  let totalQuantity = 0;
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let grandTotal = 0;

  const calculatedItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const taxRate = Number(item.taxRate || 0);
    const discount = Number(item.discount || 0);

    if (
      !item.itemId ||
      !item.name ||
      !item.category ||
      !item.unit ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0 ||
      !Number.isFinite(taxRate) ||
      taxRate < 0 ||
      taxRate > 100 ||
      !Number.isFinite(discount) ||
      discount < 0
    ) {
      throw new Error("Invalid purchase item details");
    }

    const itemSubtotal = quantity * unitPrice;

    if (discount > itemSubtotal) {
      throw new Error(
        `Discount cannot be greater than the item amount for ${item.name}`
      );
    }

    const taxableAmount = itemSubtotal - discount;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const lineTotal = taxableAmount + taxAmount;

    totalQuantity += quantity;
    subtotal += itemSubtotal;
    totalDiscount += discount;
    totalTax += taxAmount;
    grandTotal += lineTotal;

    return {
      itemId: item.itemId,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity,
      unitPrice,
      taxRate,
      discount,
      taxAmount,
      lineTotal,
    };
  });

  return {
    items: calculatedItems,
    totalQuantity,
    subtotal,
    discount: totalDiscount,
    tax: totalTax,
    grandTotal,
  };
};

// ==========================================
// GET ALL PURCHASES
// ==========================================
export const getPurchases = async (req, res) => {
  try {
    const departmentScope = getDepartmentScope(req);

    if (departmentScope === null) {
      return res.status(403).json({
        success: false,
        message: "No department is assigned to your account",
      });
    }

    const query = { ...departmentScope };

    const { search, status, supplier } = req.query;

    if (search?.trim()) {
      query.$or = [
        { purchaseNo: { $regex: search.trim(), $options: "i" } },
        { invoiceNo: { $regex: search.trim(), $options: "i" } },
        { orderedBy: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (supplier) {
      query.supplier = supplier;
    }

    const purchases = await Purchase.find(query)
      .populate("supplier", "supplierId name")
      .populate("department", "name departmentName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    console.error("Get purchases error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch purchases",
    });
  }
};

// ==========================================
// GET PURCHASE BY ID
// ==========================================
export const getPurchaseById = async (req, res) => {
  try {
    const departmentScope = getDepartmentScope(req);

    if (departmentScope === null) {
      return res.status(403).json({
        success: false,
        message: "No department is assigned to your account",
      });
    }

    const purchase = await Purchase.findOne({
      _id: req.params.id,
      ...departmentScope,
    })
      .populate("supplier", "supplierId name")
      .populate("department", "name departmentName");

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      purchase,
    });
  } catch (error) {
    console.error("Get purchase by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase",
    });
  }
};

// ==========================================
// CREATE PURCHASE
// ==========================================
export const createPurchase = async (req, res) => {
  try {
    const {
      purchaseNo,
      purchaseDate,
      supplier,
      department,
      invoiceNo,
      invoiceDate,
      status,
      orderedBy,
      notes,
      items,
    } = req.body;

    // Admin can choose a department.
    // Department users must use their assigned department.
    const finalDepartment = isAdmin(req)
      ? department
      : getAssignedDepartmentId(req);

    if (!finalDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    if (!purchaseDate || !supplier || !orderedBy || !items?.length) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase date, supplier, ordered by, and at least one item are required",
      });
    }

    const validStatuses = [
      "Draft",
      "Ordered",
      "Received",
      "Partially Received",
      "Cancelled",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase status",
      });
    }

    const selectedDepartment = await Department.findById(finalDepartment);

    if (!selectedDepartment) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const selectedSupplier = await Supplier.findById(supplier);

    if (!selectedSupplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const finalPurchaseNo =
      purchaseNo?.trim() || (await generatePurchaseNo());

    const existingPurchase = await Purchase.findOne({
      purchaseNo: finalPurchaseNo,
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: "Purchase number already exists",
      });
    }

    const calculated = calculateItems(items);

    const purchase = await Purchase.create({
      purchaseNo: finalPurchaseNo,
      purchaseDate,
      supplier,
      department: finalDepartment,
      invoiceNo,
      invoiceDate: invoiceDate || null,
      status: status || "Draft",
      orderedBy,
      notes,
      ...calculated,
    });

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate("supplier", "supplierId name")
      .populate("department", "name departmentName");

    res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      purchase: populatedPurchase,
    });
  } catch (error) {
    console.error("Create purchase error:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to create purchase",
    });
  }
};

// ==========================================
// UPDATE PURCHASE
// ==========================================
export const updatePurchase = async (req, res) => {
  try {
    const departmentScope = getDepartmentScope(req);

    if (departmentScope === null) {
      return res.status(403).json({
        success: false,
        message: "No department is assigned to your account",
      });
    }

    // Department users can only find purchases in their department
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      ...departmentScope,
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    const {
      purchaseNo,
      purchaseDate,
      supplier,
      department,
      invoiceNo,
      invoiceDate,
      status,
      orderedBy,
      notes,
      items,
    } = req.body;

    // Only admin can change the purchase department
    let finalDepartment = purchase.department;

    if (isAdmin(req) && department !== undefined) {
      finalDepartment = department;

      if (!finalDepartment) {
        return res.status(400).json({
          success: false,
          message: "Department is required",
        });
      }
    }

    // Validate the department
    const selectedDepartment = await Department.findById(finalDepartment);

    if (!selectedDepartment) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Validate supplier if supplied
    const finalSupplier = supplier || purchase.supplier;

    const selectedSupplier = await Supplier.findById(finalSupplier);

    if (!selectedSupplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // Validate purchase status
    const validStatuses = [
      "Draft",
      "Ordered",
      "Received",
      "Partially Received",
      "Cancelled",
    ];

    const finalStatus = status || purchase.status;

    if (!validStatuses.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase status",
      });
    }

    // Check purchase number uniqueness
    const finalPurchaseNo = purchaseNo?.trim() || purchase.purchaseNo;

    const duplicatePurchase = await Purchase.findOne({
      purchaseNo: finalPurchaseNo,
      _id: { $ne: purchase._id },
    });

    if (duplicatePurchase) {
      return res.status(400).json({
        success: false,
        message: "Purchase number already exists",
      });
    }

    // Recalculate totals only when items are supplied
    const calculated = items !== undefined
      ? calculateItems(items)
      : {
          items: purchase.items,
          totalQuantity: purchase.totalQuantity,
          subtotal: purchase.subtotal,
          discount: purchase.discount,
          tax: purchase.tax,
          grandTotal: purchase.grandTotal,
        };

    purchase.purchaseNo = finalPurchaseNo;
    purchase.purchaseDate = purchaseDate || purchase.purchaseDate;
    purchase.supplier = finalSupplier;
    purchase.department = finalDepartment;
    purchase.invoiceNo =
      invoiceNo !== undefined ? invoiceNo : purchase.invoiceNo;
    purchase.invoiceDate =
      invoiceDate !== undefined ? invoiceDate : purchase.invoiceDate;
    purchase.status = finalStatus;
    purchase.orderedBy = orderedBy || purchase.orderedBy;
    purchase.notes = notes !== undefined ? notes : purchase.notes;

    purchase.items = calculated.items;
    purchase.totalQuantity = calculated.totalQuantity;
    purchase.subtotal = calculated.subtotal;
    purchase.discount = calculated.discount;
    purchase.tax = calculated.tax;
    purchase.grandTotal = calculated.grandTotal;

    await purchase.save();

    const updatedPurchase = await Purchase.findById(purchase._id)
      .populate("supplier", "supplierId name")
      .populate("department", "name departmentName");

    res.status(200).json({
      success: true,
      message: "Purchase updated successfully",
      purchase: updatedPurchase,
    });
  } catch (error) {
    console.error("Update purchase error:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to update purchase",
    });
  }
};

// ==========================================
// UPDATE PURCHASE STATUS
// ==========================================
export const updatePurchaseStatus = async (req, res) => {
  try {
    const departmentScope = getDepartmentScope(req);

    if (departmentScope === null) {
      return res.status(403).json({
        success: false,
        message: "No department is assigned to your account",
      });
    }

    const { status } = req.body;

    const validStatuses = [
      "Draft",
      "Ordered",
      "Received",
      "Partially Received",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase status",
      });
    }

    const purchase = await Purchase.findOne({
      _id: req.params.id,
      ...departmentScope,
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    purchase.status = status;
    await purchase.save();

    res.status(200).json({
      success: true,
      message: "Purchase status updated successfully",
      purchase,
    });
  } catch (error) {
    console.error("Update purchase status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update purchase status",
    });
  }
};

// ==========================================
// DELETE PURCHASE
// ADMIN ONLY
// ==========================================
export const deletePurchase = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete purchases",
      });
    }

    const purchase = await Purchase.findByIdAndDelete(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Purchase deleted successfully",
    });
  } catch (error) {
    console.error("Delete purchase error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete purchase",
    });
  }
};
