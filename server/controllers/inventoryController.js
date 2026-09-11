import Inventory from "../models/Inventory.js";
import Purchase from "../models/Purchase.js";
import Department from "../models/Department.js";

const calculateStatus = (available, minimumStock) => {
  if (available <= 0) {
    return "Out of Stock";
  }

  if (available <= minimumStock) {
    return "Low Stock";
  }

  return "Available";
};

// ======================================================
// GET PURCHASED ITEMS AVAILABLE FOR INVENTORY
// ======================================================

export const getPurchasedItems = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      status: {
        $in: ["Received", "Partially Received"],
      },
    })
      .select("purchaseNo purchaseDate supplier status items")
      .populate("supplier", "supplierId name")
      .sort({
        purchaseDate: -1,
      });

    const existingInventory = await Inventory.find()
      .select("purchase purchaseItemCode")
      .lean();

    const existingSet = new Set(
      existingInventory.map(
        (item) => `${item.purchase}_${item.purchaseItemCode}`,
      ),
    );

    const purchasedItems = [];

    for (const purchase of purchases) {
      for (const item of purchase.items) {
        const key = `${purchase._id}_${item.itemId}`;

        if (existingSet.has(key)) {
          continue;
        }

        purchasedItems.push({
          purchaseId: purchase._id,
          purchaseNo: purchase.purchaseNo,
          purchaseDate: purchase.purchaseDate,

          supplier: purchase.supplier,

          itemCode: item.itemId,
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: item.quantity,
          availableQuantity: item.quantity,

          purchaseStatus: purchase.status,
        });
      }
    }

    res.status(200).json({
      success: true,
      count: purchasedItems.length,
      items: purchasedItems,
    });
  } catch (error) {
    console.error("Get purchased inventory items error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch purchased items",
    });
  }
};

// ======================================================
// GET ALL INVENTORY
// ======================================================

export const getInventory = async (req, res) => {
  try {
    const {
      search = "",
      category = "All",
      status = "All",
      department = "All",
    } = req.query;

    const query = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      query.$or = [
        {
          name: regex,
        },
        {
          itemCode: regex,
        },
        {
          category: regex,
        },
      ];
    }

    if (category !== "All") {
      query.category = category;
    }

    if (status !== "All") {
      query.status = status;
    }

    if (department !== "All") {
      query.department = department;
    }

    const inventory = await Inventory.find(query)
      .populate("department", "name departmentName code")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      error: error.name,
    });
  }
};

// ======================================================
// GET SINGLE INVENTORY ITEM
// ======================================================

export const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate(
      "department",
      "name departmentName code",
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    res.status(200).json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error("Get inventory item error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory item",
    });
  }
};

// ======================================================
// CREATE INVENTORY ITEM FROM PURCHASE
// ======================================================

export const createInventory = async (req, res) => {
  try {
    const {
      name,
      itemCode,
      category,
      department,
      unit,
      quantity,
      minimumStock,
      description,
    } = req.body;

    // -------------------------
    // VALIDATION
    // -------------------------

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    if (!unit?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Unit is required",
      });
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid non-negative number",
      });
    }

    const parsedMinimumStock = Number(minimumStock) || 0;

    if (!Number.isFinite(parsedMinimumStock) || parsedMinimumStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Minimum stock must be a valid non-negative number",
      });
    }

    // -------------------------
    // CHECK DEPARTMENT
    // -------------------------

    const departmentExists = await Department.findById(department);

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // -------------------------
    // ITEM CODE
    // -------------------------

    const finalItemCode = itemCode?.trim() || `INV-${Date.now()}`;

    // -------------------------
    // CHECK DUPLICATE ITEM CODE
    // -------------------------

    const existingInventory = await Inventory.findOne({
      itemCode: finalItemCode,
    });

    if (existingInventory) {
      return res.status(409).json({
        success: false,
        message: "An inventory item with this item code already exists",
      });
    }

    // -------------------------
    // AVAILABLE QUANTITY
    // -------------------------

    const available = parsedQuantity;

    // -------------------------
    // STATUS
    // -------------------------

    const status = calculateStatus(available, parsedMinimumStock);

    // -------------------------
    // CREATE INVENTORY
    // -------------------------

    const inventory = await Inventory.create({
      itemCode: finalItemCode,

      name: name.trim(),

      category: category.trim(),

      department,

      unit: unit.trim(),

      quantity: parsedQuantity,

      available,

      minimumStock: parsedMinimumStock,

      status,

      description: description?.trim() || "",
    });

    // -------------------------
    // POPULATE
    // -------------------------

    const populatedInventory = await Inventory.findById(inventory._id).populate(
      "department",
      "name departmentName code",
    );

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      inventory: populatedInventory,
    });
  } catch (error) {
    console.error("Create inventory error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An inventory item with this item code already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Failed to create inventory item",
    });
  }
};

// ======================================================
// UPDATE INVENTORY
// ======================================================

export const updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const { department, quantity, available, minimumStock, description } =
      req.body;

    // -------------------------
    // DEPARTMENT
    // -------------------------

    if (department) {
      const departmentExists = await Department.findById(department);

      if (!departmentExists) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      inventory.department = department;
    }

    // -------------------------
    // QUANTITY
    // -------------------------

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);

      if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a valid non-negative number",
        });
      }

      inventory.quantity = parsedQuantity;
    }

    // -------------------------
    // AVAILABLE
    // -------------------------

    if (available !== undefined) {
      const parsedAvailable = Number(available);

      if (!Number.isFinite(parsedAvailable) || parsedAvailable < 0) {
        return res.status(400).json({
          success: false,
          message: "Available quantity must be a valid non-negative number",
        });
      }

      if (parsedAvailable > inventory.quantity) {
        return res.status(400).json({
          success: false,
          message: "Available quantity cannot be greater than total quantity",
        });
      }

      inventory.available = parsedAvailable;
    }

    // -------------------------
    // MINIMUM STOCK
    // -------------------------

    if (minimumStock !== undefined) {
      const parsedMinimum = Number(minimumStock);

      if (!Number.isFinite(parsedMinimum) || parsedMinimum < 0) {
        return res.status(400).json({
          success: false,
          message: "Minimum stock must be a valid non-negative number",
        });
      }

      inventory.minimumStock = parsedMinimum;
    }

    // -------------------------
    // DESCRIPTION
    // -------------------------

    if (description !== undefined) {
      inventory.description = description?.trim() || "";
    }

    // -------------------------
    // STATUS
    // -------------------------

    inventory.status = calculateStatus(
      inventory.available,
      inventory.minimumStock,
    );

    await inventory.save();

    const updatedInventory = await Inventory.findById(inventory._id).populate(
      "department",
      "name departmentName code",
    );

    res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      inventory: updatedInventory,
    });
  } catch (error) {
    console.error("Update inventory error:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to update inventory",
    });
  }
};

// ======================================================
// DELETE INVENTORY
// ======================================================

export const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Delete inventory error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
    });
  }
};
