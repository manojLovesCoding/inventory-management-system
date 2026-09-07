import Purchase from "../models/Purchase.js";
import Supplier from "../models/Supplier.js";

const purchaseStatuses = [
  "Draft",
  "Ordered",
  "Received",
  "Partially Received",
  "Cancelled",
];

// =========================
// GENERATE PURCHASE NUMBER
// =========================

const generatePurchaseNo = async () => {
  const year = new Date().getFullYear();

  const prefix = `PO-${year}-`;

  const lastPurchase = await Purchase.findOne({
    purchaseNo: {
      $regex: `^${prefix}`,
    },
  })
    .sort({ purchaseNo: -1 })
    .select("purchaseNo");

  if (!lastPurchase) {
    return `${prefix}001`;
  }

  const lastNumber = Number(
    lastPurchase.purchaseNo.replace(prefix, "")
  );

  const nextNumber = lastNumber + 1;

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

// =========================
// VALIDATE ITEMS
// =========================

const calculateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one purchase item is required");
  }

  const itemIds = new Set();

  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let totalQuantity = 0;

  const calculatedItems = items.map((item) => {
    if (!item.itemId) {
      throw new Error("Item ID is required");
    }

    if (!item.name) {
      throw new Error("Item name is required");
    }

    if (!item.category) {
      throw new Error("Item category is required");
    }

    if (!item.unit) {
      throw new Error("Item unit is required");
    }

    if (itemIds.has(item.itemId)) {
      throw new Error(
        `Item ${item.itemId} is already added to this purchase`
      );
    }

    itemIds.add(item.itemId);

    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const taxRate = Number(item.taxRate) || 0;
    const discount = Number(item.discount) || 0;

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(
        `Invalid quantity for item ${item.itemId}`
      );
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(
        `Invalid unit price for item ${item.itemId}`
      );
    }

    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      throw new Error(
        `Invalid tax rate for item ${item.itemId}`
      );
    }

    const lineSubtotal = quantity * unitPrice;

    if (discount < 0) {
      throw new Error(
        `Discount cannot be negative for item ${item.itemId}`
      );
    }

    if (discount > lineSubtotal) {
      throw new Error(
        `Discount cannot be greater than item value for ${item.itemId}`
      );
    }

    const taxableValue = lineSubtotal - discount;

    const taxAmount =
      taxableValue * (taxRate / 100);

    const lineTotal =
      taxableValue + taxAmount;

    subtotal += lineSubtotal;
    totalDiscount += discount;
    totalTax += taxAmount;
    totalQuantity += quantity;

    return {
      itemId: item.itemId.trim(),
      name: item.name.trim(),
      category: item.category.trim(),
      unit: item.unit.trim(),
      quantity,
      unitPrice,
      taxRate,
      discount,
      taxAmount: Number(taxAmount.toFixed(2)),
      lineTotal: Number(lineTotal.toFixed(2)),
    };
  });

  const grandTotal =
    subtotal - totalDiscount + totalTax;

  return {
    items: calculatedItems,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(totalDiscount.toFixed(2)),
    tax: Number(totalTax.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
    totalQuantity,
  };
};

// =========================
// GET ALL PURCHASES
// =========================

export const getPurchases = async (req, res) => {
  try {
    const {
      search = "",
      status = "All",
      supplier = "",
    } = req.query;

    const query = {};

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      query.$or = [
        { purchaseNo: searchRegex },
        { invoiceNo: searchRegex },
        { orderedBy: searchRegex },
        { "items.name": searchRegex },
        { "items.itemId": searchRegex },
      ];
    }

    if (status !== "All") {
      query.status = status;
    }

    if (supplier.trim()) {
      query.supplier = supplier.trim();
    }

    const purchases = await Purchase.find(query)
      .populate(
        "supplier",
        "supplierId name gstin contactPerson phone email city state"
      )
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
      message: "Server error",
    });
  }
};

// =========================
// GET SINGLE PURCHASE
// =========================

export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(
      req.params.id
    ).populate(
      "supplier",
      "supplierId name gstin contactPerson phone email address city state pincode status"
    );

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
    console.error("Get purchase error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// CREATE PURCHASE
// =========================

export const createPurchase = async (req, res) => {
  try {
    const {
      purchaseNo,
      purchaseDate,
      supplier,
      invoiceNo,
      invoiceDate,
      status,
      orderedBy,
      notes,
      items,
    } = req.body;

    // -------------------------
    // BASIC VALIDATION
    // -------------------------

    if (!purchaseDate) {
      return res.status(400).json({
        success: false,
        message: "Purchase date is required",
      });
    }

    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier is required",
      });
    }

    if (!orderedBy?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Ordered by is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one purchase item is required",
      });
    }

    // -------------------------
    // CHECK SUPPLIER
    // -------------------------

    const supplierExists = await Supplier.findById(
      supplier
    );

    if (!supplierExists) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // -------------------------
    // PURCHASE NUMBER
    // -------------------------

    let finalPurchaseNo =
      purchaseNo?.trim();

    if (!finalPurchaseNo) {
      finalPurchaseNo =
        await generatePurchaseNo();
    }

    const existingPurchase =
      await Purchase.findOne({
        purchaseNo: finalPurchaseNo,
      });

    if (existingPurchase) {
      return res.status(409).json({
        success: false,
        message: "Purchase number already exists",
      });
    }

    // -------------------------
    // STATUS
    // -------------------------

    const finalStatus = status || "Draft";

    if (!purchaseStatuses.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase status",
      });
    }

    // -------------------------
    // CALCULATE TOTALS
    // -------------------------

    const calculated =
      calculateItems(items);

    // -------------------------
    // CREATE
    // -------------------------

    const purchase = await Purchase.create({
      purchaseNo: finalPurchaseNo,
      purchaseDate,
      supplier,
      invoiceNo: invoiceNo?.trim() || "",
      invoiceDate: invoiceDate || null,
      status: finalStatus,
      orderedBy: orderedBy.trim(),
      notes: notes?.trim() || "",
      ...calculated,
    });

    const populatedPurchase =
      await Purchase.findById(purchase._id)
        .populate(
          "supplier",
          "supplierId name gstin contactPerson phone email address city state pincode status"
        );

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      purchase: populatedPurchase,
    });
  } catch (error) {
    console.error(
      "Create purchase error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message || "Failed to create purchase",
    });
  }
};

// =========================
// UPDATE PURCHASE
// =========================

export const updatePurchase = async (req, res) => {
  try {
    const purchase =
      await Purchase.findById(req.params.id);

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
      invoiceNo,
      invoiceDate,
      status,
      orderedBy,
      notes,
      items,
    } = req.body;

    // -------------------------
    // VALIDATION
    // -------------------------

    if (!purchaseDate) {
      return res.status(400).json({
        success: false,
        message: "Purchase date is required",
      });
    }

    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier is required",
      });
    }

    if (!orderedBy?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Ordered by is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one purchase item is required",
      });
    }

    // -------------------------
    // CHECK SUPPLIER
    // -------------------------

    const supplierExists = await Supplier.findById(
      supplier
    );

    if (!supplierExists) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // -------------------------
    // PURCHASE NUMBER
    // -------------------------

    const finalPurchaseNo =
      purchaseNo?.trim() || purchase.purchaseNo;

    const duplicatePurchase =
      await Purchase.findOne({
        purchaseNo: finalPurchaseNo,
        _id: { $ne: purchase._id },
      });

    if (duplicatePurchase) {
      return res.status(409).json({
        success: false,
        message: "Purchase number already exists",
      });
    }

    // -------------------------
    // STATUS
    // -------------------------

    const finalStatus =
      status || purchase.status;

    if (!purchaseStatuses.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase status",
      });
    }

    // -------------------------
    // CALCULATE
    // -------------------------

    const calculated =
      calculateItems(items);

    // -------------------------
    // UPDATE
    // -------------------------

    purchase.purchaseNo =
      finalPurchaseNo;

    purchase.purchaseDate =
      purchaseDate;

    purchase.supplier =
      supplier;

    purchase.invoiceNo =
      invoiceNo?.trim() || "";

    purchase.invoiceDate =
      invoiceDate || null;

    purchase.status =
      finalStatus;

    purchase.orderedBy =
      orderedBy.trim();

    purchase.notes =
      notes?.trim() || "";

    purchase.items =
      calculated.items;

    purchase.subtotal =
      calculated.subtotal;

    purchase.discount =
      calculated.discount;

    purchase.tax =
      calculated.tax;

    purchase.grandTotal =
      calculated.grandTotal;

    purchase.totalQuantity =
      calculated.totalQuantity;

    await purchase.save();

    const updatedPurchase =
      await Purchase.findById(
        purchase._id
      ).populate(
        "supplier",
        "supplierId name gstin contactPerson phone email address city state pincode status"
      );

    res.status(200).json({
      success: true,
      message: "Purchase updated successfully",
      purchase: updatedPurchase,
    });
  } catch (error) {
    console.error(
      "Update purchase error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message || "Failed to update purchase",
    });
  }
};

// =========================
// UPDATE PURCHASE STATUS
// =========================

export const updatePurchaseStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!purchaseStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase status",
      });
    }

    const purchase =
      await Purchase.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "supplier",
        "supplierId name gstin contactPerson phone email address city state pincode status"
      );

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Purchase marked as ${status}`,
      purchase,
    });
  } catch (error) {
    console.error(
      "Update purchase status error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// DELETE PURCHASE
// =========================

export const deletePurchase = async (
  req,
  res
) => {
  try {
    const purchase =
      await Purchase.findById(
        req.params.id
      );

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    await Purchase.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Purchase deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete purchase error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
