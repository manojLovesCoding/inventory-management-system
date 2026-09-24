import StockIn from "../models/StockIn.js";
import Supplier from "../models/Supplier.js";
import Purchase from "../models/Purchase.js";
import Inventory from "../models/Inventory.js"

const stockInStatuses = [
  "Pending",
  "Received",
  "Cancelled",
];

// =========================
// GENERATE STOCK IN NUMBER
// =========================

const generateStockInNo = async () => {
  const year = new Date().getFullYear();

  const prefix = `SIN-${year}-`;

  const lastStockIn = await StockIn.findOne({
    stockInNo: {
      $regex: `^${prefix}`,
    },
  })
    .sort({ stockInNo: -1 })
    .select("stockInNo");

  if (!lastStockIn) {
    return `${prefix}001`;
  }

  const lastNumber = Number(
    lastStockIn.stockInNo.replace(prefix, "")
  );

  return `${prefix}${String(lastNumber + 1).padStart(3, "0")}`;
};

// =========================
// CALCULATE ITEM
// =========================

const calculateItem = (item) => {
  if (!item) {
    throw new Error("Item is required");
  }

  const itemId = item.itemId?.trim();
  const itemName = item.item?.trim();
  const category = item.category?.trim();
  const unit = item.unit?.trim() || "units";

  if (!itemId) {
    throw new Error("Item ID is required");
  }

  if (!itemName) {
    throw new Error("Item name is required");
  }

  if (!category) {
    throw new Error("Item category is required");
  }

  const quantity = Number(item.quantity);
  const unitPrice = Number(item.unitPrice);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new Error("Unit price cannot be negative");
  }

  const totalValue = quantity * unitPrice;

  return {
    itemId,
    item: itemName,
    category,
    unit,
    quantity,
    unitPrice,
    totalValue: Number(totalValue.toFixed(2)),
  };
};

// =========================
const calculateInventoryStatus = (available, minimumStock = 0) => {
  if (available <= 0) return "Out of Stock";
  if (minimumStock > 0 && available <= minimumStock) return "Low Stock";
  return "Available";
};

const applyStockInToInventory = async (itemData) => {
  const { itemId, item, category, unit, quantity } = itemData;

  // Find by itemCode (or _id fallback if itemId matches an ObjectId)
  let inventoryItem = await Inventory.findOne({
    $or: [{ itemCode: itemId }, { name: item }],
  });

  if (inventoryItem) {
    // Increment existing stock
    inventoryItem.quantity = (Number(inventoryItem.quantity) || 0) + Number(quantity);
    inventoryItem.available = (Number(inventoryItem.available) || 0) + Number(quantity);
    inventoryItem.status = calculateInventoryStatus(
      inventoryItem.available,
      inventoryItem.minimumStock
    );
    await inventoryItem.save();
  }
};

// =========================
// GET ALL STOCK IN
// =========================

export const getStockIns = async (req, res) => {
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
        { stockInNo: searchRegex },
        { referenceNo: searchRegex },
        { receivedBy: searchRegex },
        { "item.item": searchRegex },
        { "item.itemId": searchRegex },
        { "item.category": searchRegex },
      ];
    }

    if (status !== "All") {
      query.status = status;
    }

    if (supplier.trim()) {
      query.supplier = supplier.trim();
    }

    const stockIns = await StockIn.find(query)
      .populate(
        "supplier",
        "supplierId name gstin contactPerson phone email city state"
      )
      .populate(
        "purchase",
        "purchaseNo purchaseDate status"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stockIns.length,
      stockIns,
    });
  } catch (error) {
    console.error("Get stock in error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET SINGLE STOCK IN
// =========================

export const getStockInById = async (req, res) => {
  try {
    const stockIn = await StockIn.findById(
      req.params.id
    )
      .populate(
        "supplier",
        "supplierId name gstin contactPerson phone email address city state pincode status"
      )
      .populate(
        "purchase",
        "purchaseNo purchaseDate invoiceNo status"
      );

    if (!stockIn) {
      return res.status(404).json({
        success: false,
        message: "Stock In record not found",
      });
    }

    res.status(200).json({
      success: true,
      stockIn,
    });
  } catch (error) {
    console.error("Get stock in error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// CREATE STOCK IN
// =========================

export const createStockIn = async (req, res) => {
  try {
    const {
      stockInNo,
      referenceNo,
      purchase,
      supplier,
      receivedDate,
      receivedBy,
      status,
      item,
      notes,
    } = req.body;

    // -------------------------
    // BASIC VALIDATION
    // -------------------------

    if (!referenceNo?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reference / PO number is required",
      });
    }

    if (!receivedDate) {
      return res.status(400).json({
        success: false,
        message: "Received date is required",
      });
    }

    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier is required",
      });
    }

    if (!receivedBy?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Received by is required",
      });
    }

    // -------------------------
    // CHECK SUPPLIER
    // -------------------------

    const supplierExists =
      await Supplier.findById(supplier);

    if (!supplierExists) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // -------------------------
    // CHECK PURCHASE
    // -------------------------

    let purchaseExists = null;

    if (purchase) {
      purchaseExists =
        await Purchase.findById(purchase);

      if (!purchaseExists) {
        return res.status(404).json({
          success: false,
          message: "Purchase not found",
        });
      }
    }

    // -------------------------
    // STOCK IN NUMBER
    // -------------------------

    let finalStockInNo =
      stockInNo?.trim();

    if (!finalStockInNo) {
      finalStockInNo =
        await generateStockInNo();
    }

    const duplicate =
      await StockIn.findOne({
        stockInNo: finalStockInNo,
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Stock In number already exists",
      });
    }

    // -------------------------
    // STATUS
    // -------------------------

    const finalStatus = status || "Pending";

    if (!stockInStatuses.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock in status",
      });
    }

    // -------------------------
    // ITEM
    // -------------------------

    const calculatedItem =
      calculateItem(item);

    // -------------------------
    // CREATE
    // -------------------------

    const stockIn = await StockIn.create({
      stockInNo: finalStockInNo,
      referenceNo: referenceNo.trim(),
      purchase: purchase || null,
      supplier,
      receivedDate,
      receivedBy: receivedBy.trim(),
      status: finalStatus,
      item: calculatedItem,
      notes: notes?.trim() || "",
    });

    // --- UPDATE INVENTORY IF RECEIVED ---
    if (finalStatus === "Received") {
      await applyStockInToInventory(calculatedItem);
    }

    const populatedStockIn =
      await StockIn.findById(stockIn._id)
        .populate(
          "supplier",
          "supplierId name gstin contactPerson phone email address city state pincode status"
        )
        .populate(
          "purchase",
          "purchaseNo purchaseDate invoiceNo status"
        );

    res.status(201).json({
      success: true,
      message: "Stock In record created successfully",
      stockIn: populatedStockIn,
    });
  } catch (error) {
    console.error(
      "Create stock in error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create Stock In record",
    });
  }
};

// =========================
// UPDATE STOCK IN
// =========================

export const updateStockIn = async (req, res) => {
  try {
    const stockIn =
      await StockIn.findById(req.params.id);

    if (!stockIn) {
      return res.status(404).json({
        success: false,
        message: "Stock In record not found",
      });
    }

    const {
      stockInNo,
      referenceNo,
      purchase,
      supplier,
      receivedDate,
      receivedBy,
      status,
      item,
      notes,
    } = req.body;

    if (!referenceNo?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reference / PO number is required",
      });
    }

    if (!receivedDate) {
      return res.status(400).json({
        success: false,
        message: "Received date is required",
      });
    }

    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier is required",
      });
    }

    if (!receivedBy?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Received by is required",
      });
    }

    const supplierExists =
      await Supplier.findById(supplier);

    if (!supplierExists) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    if (purchase) {
      const purchaseExists =
        await Purchase.findById(purchase);

      if (!purchaseExists) {
        return res.status(404).json({
          success: false,
          message: "Purchase not found",
        });
      }
    }

    const finalStockInNo =
      stockInNo?.trim() || stockIn.stockInNo;

    const duplicate =
      await StockIn.findOne({
        stockInNo: finalStockInNo,
        _id: { $ne: stockIn._id },
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Stock In number already exists",
      });
    }

    const finalStatus =
      status || stockIn.status;

    if (!stockInStatuses.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock in status",
      });
    }

    const calculatedItem =
      calculateItem(item);

    stockIn.stockInNo =
      finalStockInNo;

    stockIn.referenceNo =
      referenceNo.trim();

    stockIn.purchase =
      purchase || null;

    stockIn.supplier =
      supplier;

    stockIn.receivedDate =
      receivedDate;

    stockIn.receivedBy =
      receivedBy.trim();

    stockIn.status =
      finalStatus;

    stockIn.item =
      calculatedItem;

    stockIn.notes =
      notes?.trim() || "";

    await stockIn.save();

    const updatedStockIn =
      await StockIn.findById(
        stockIn._id
      )
        .populate(
          "supplier",
          "supplierId name gstin contactPerson phone email address city state pincode status"
        )
        .populate(
          "purchase",
          "purchaseNo purchaseDate invoiceNo status"
        );

    res.status(200).json({
      success: true,
      message: "Stock In record updated successfully",
      stockIn: updatedStockIn,
    });
  } catch (error) {
    console.error(
      "Update stock in error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update Stock In record",
    });
  }
};

// =========================
// UPDATE STATUS
// =========================

export const updateStockInStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!stockInStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock in status",
      });
    }

    const existingStockIn = await StockIn.findById(req.params.id);

    if (!existingStockIn) {
      return res.status(404).json({
        success: false,
        message: "Stock In record not found",
      });
    }

    const previousStatus = existingStockIn.status;
    existingStockIn.status = status;
    await existingStockIn.save();

    // If status transitions from Pending/Cancelled to Received, increment inventory
    if (status === "Received" && previousStatus !== "Received") {
      await applyStockInToInventory(existingStockIn.item);
    }

    const populatedStockIn = await StockIn.findById(existingStockIn._id)
      .populate("supplier", "supplierId name gstin contactPerson phone email address city state pincode status")
      .populate("purchase", "purchaseNo purchaseDate invoiceNo status");

    res.status(200).json({
      success: true,
      message: `Stock In marked as ${status}`,
      stockIn: populatedStockIn,
    });
  } catch (error) {
    console.error("Update stock in status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// DELETE
// =========================

export const deleteStockIn = async (
  req,
  res
) => {
  try {
    const stockIn =
      await StockIn.findById(
        req.params.id
      );

    if (!stockIn) {
      return res.status(404).json({
        success: false,
        message: "Stock In record not found",
      });
    }

    await StockIn.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Stock In record deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete stock in error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
