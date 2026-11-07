import Inventory from "../models/Inventory.js";
import Purchase from "../models/Purchase.js";
import Department from "../models/Department.js";

// ======================================================
// GET USER'S ASSIGNED DEPARTMENT
// ======================================================

const getAssignedDepartmentId = (req) => {
  const department =
    req.user?.department?._id ||
    req.user?.department ||
    req.user?.departmentId;

  return department ? String(department) : null;
};

// ======================================================
// CHECK WHETHER USER IS ADMIN
// ======================================================

const isAdmin = (req) => {
  return req.user?.role === "admin";
};

// ======================================================
// CALCULATE INVENTORY STATUS
// ======================================================

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
    const purchaseQuery = {
      status: {
        $in: ["Received", "Partially Received"],
      },
    };

    if (!isAdmin(req)) {
      const departmentId = getAssignedDepartmentId(req);

      if (!departmentId) {
        return res.status(403).json({
          success: false,
          message: "No department is assigned to your account",
        });
      }

      purchaseQuery.department = departmentId;
    }

    const purchases = await Purchase.find(purchaseQuery)
      .select(
        "purchaseNo purchaseDate supplier status items department"
      )
      .populate("supplier", "supplierId name")
      .sort({
        purchaseDate: -1,
      });

    const existingInventoryQuery = {};

    if (!isAdmin(req)) {
      existingInventoryQuery.department =
        getAssignedDepartmentId(req);
    }

    const existingInventory = await Inventory.find(
      existingInventoryQuery
    )
      .select("purchase purchaseItemCode")
      .lean();

    const existingSet = new Set(
      existingInventory
        .filter((item) => item.purchase && item.purchaseItemCode)
        .map(
          (item) => `${item.purchase}_${item.purchaseItemCode}`
        )
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
          department: purchase.department,

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

    // ==================================================
    // DEPARTMENT ACCESS
    // ==================================================

    if (!isAdmin(req)) {
      const departmentId = getAssignedDepartmentId(req);

      if (!departmentId) {
        return res.status(403).json({
          success: false,
          message: "No department is assigned to your account",
        });
      }

      // Department users can only see their own department.
      // Ignore any department ID sent through query parameters.
      query.department = departmentId;
    } else {
      // Admin can filter inventory by any department.
      if (department !== "All") {
        query.department = department;
      }
    }

    // ==================================================
    // SEARCH
    // ==================================================

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

    // ==================================================
    // CATEGORY FILTER
    // ==================================================

    if (category !== "All") {
      query.category = category;
    }

    // ==================================================
    // STATUS FILTER
    // ==================================================

    if (status !== "All") {
      query.status = status;
    }

    // ==================================================
    // FETCH INVENTORY
    // ==================================================

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
    const query = {
      _id: req.params.id,
    };

    // Department users can only access an item
    // belonging to their assigned department.
    if (!isAdmin(req)) {
      const departmentId = getAssignedDepartmentId(req);

      if (!departmentId) {
        return res.status(403).json({
          success: false,
          message: "No department is assigned to your account",
        });
      }

      query.department = departmentId;
    }

    const inventory = await Inventory.findOne(query).populate(
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
// GENERATE SEQUENTIAL ITEM CODE
// ======================================================

const generateSequentialItemCode = async () => {
  const prefix = "ITM-";

  const lastItem = await Inventory.findOne({
    itemCode: new RegExp(`^${prefix}`),
  })
    .sort({
      createdAt: -1,
    })
    .select("itemCode");

  let nextNum = 1;

  if (lastItem?.itemCode) {
    const rawNumber = parseInt(
      lastItem.itemCode.replace(prefix, ""),
      10,
    );

    if (!Number.isNaN(rawNumber)) {
      nextNum = rawNumber + 1;
    }
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
};

// ======================================================
// CREATE INVENTORY ITEM
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

      // Optional purchase information.
      purchase,
      purchaseItemCode,
    } = req.body;

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

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

    if (!unit?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Unit is required",
      });
    }

    // ==================================================
    // DEPARTMENT
    // ==================================================

    let finalDepartment;

    if (isAdmin(req)) {
      // Admin can select any department.
      finalDepartment = department;
    } else {
      // Department user must use their assigned department.
      finalDepartment = getAssignedDepartmentId(req);

      if (!finalDepartment) {
        return res.status(403).json({
          success: false,
          message: "No department is assigned to your account",
        });
      }
    }

    if (!finalDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    const departmentExists = await Department.findById(
      finalDepartment,
    );

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // ==================================================
    // QUANTITY
    // ==================================================

    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid non-negative number",
      });
    }

    // ==================================================
    // MINIMUM STOCK
    // ==================================================

    const parsedMinimumStock =
      minimumStock === undefined || minimumStock === ""
        ? 0
        : Number(minimumStock);

    if (
      !Number.isFinite(parsedMinimumStock) ||
      parsedMinimumStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum stock must be a valid non-negative number",
      });
    }

    // ==================================================
    // ITEM CODE
    // ==================================================

    let finalItemCode = itemCode?.trim();

    if (!finalItemCode) {
      finalItemCode = await generateSequentialItemCode();
    } else {
      const existingInventory = await Inventory.findOne({
        itemCode: finalItemCode,
      });

      if (existingInventory) {
        return res.status(409).json({
          success: false,
          message: `Item code "${finalItemCode}" is already in use. Please enter a unique code or leave it blank.`,
        });
      }
    }

    // ==================================================
    // STATUS
    // ==================================================

    const available = parsedQuantity;

    const status = calculateStatus(
      available,
      parsedMinimumStock,
    );

    // ==================================================
    // CREATE INVENTORY DATA
    // ==================================================

    const inventoryData = {
      itemCode: finalItemCode,
      name: name.trim(),
      category: category.trim(),
      department: finalDepartment,
      unit: unit.trim(),
      quantity: parsedQuantity,
      available,
      minimumStock: parsedMinimumStock,
      status,
      description: description?.trim() || "",
    };

    // ==================================================
    // PURCHASE INFORMATION
    // ==================================================

    if (purchase) {
      inventoryData.purchase = purchase;
    }

    if (purchaseItemCode) {
      inventoryData.purchaseItemCode = purchaseItemCode.trim();
    }

    // ==================================================
    // CREATE
    // ==================================================

    const inventory = await Inventory.create(inventoryData);

    // ==================================================
    // POPULATE DEPARTMENT
    // ==================================================

    const populatedInventory = await Inventory.findById(
      inventory._id,
    ).populate(
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

    // ==================================================
    // DUPLICATE KEY
    // ==================================================

    if (error.code === 11000) {
      const duplicateFields = Object.keys(
        error.keyPattern || error.keyValue || {},
      );

      if (duplicateFields.includes("itemCode")) {
        return res.status(409).json({
          success: false,
          message: `Item code "${error.keyValue?.itemCode || ""}" is already in use.`,
        });
      }

      if (
        duplicateFields.includes("purchase") ||
        duplicateFields.includes("purchaseItemCode")
      ) {
        return res.status(409).json({
          success: false,
          message: "This purchase item has already been added to inventory.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "A duplicate inventory item already exists.",
      });
    }

    // ==================================================
    // OTHER ERRORS
    // ==================================================

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
    // ==================================================
    // FIND INVENTORY ITEM
    // ==================================================

    const query = {
      _id: req.params.id,
    };

    if (!isAdmin(req)) {
      const departmentId = getAssignedDepartmentId(req);

      if (!departmentId) {
        return res.status(403).json({
          success: false,
          message: "No department is assigned to your account",
        });
      }

      // Department users can update only their own items.
      query.department = departmentId;
    }

    const inventory = await Inventory.findOne(query);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const {
      name,
      category,
      department,
      unit,
      quantity,
      available,
      minimumStock,
      description,
    } = req.body;

    // ==================================================
    // NAME
    // ==================================================

    if (name !== undefined) {
      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Item name is required",
        });
      }

      inventory.name = name.trim();
    }

    // ==================================================
    // CATEGORY
    // ==================================================

    if (category !== undefined) {
      if (!category?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category is required",
        });
      }

      inventory.category = category.trim();
    }

    // ==================================================
    // DEPARTMENT
    // ==================================================

    if (isAdmin(req)) {
      // Admin can change the department.
      if (department) {
        const departmentExists = await Department.findById(
          department,
        );

        if (!departmentExists) {
          return res.status(404).json({
            success: false,
            message: "Department not found",
          });
        }

        inventory.department = department;
      }
    } else {
      // Department users cannot move inventory
      // to another department.
      const assignedDepartmentId = getAssignedDepartmentId(req);

      if (
        department &&
        String(department) !== assignedDepartmentId
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot change the department of this inventory item",
        });
      }

      // Keep the item in the user's assigned department.
      inventory.department = assignedDepartmentId;
    }

    // ==================================================
    // UNIT
    // ==================================================

    if (unit !== undefined) {
      if (!unit?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Unit is required",
        });
      }

      inventory.unit = unit.trim();
    }

    // ==================================================
    // QUANTITY
    // ==================================================

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);

      if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a valid non-negative number",
        });
      }

      inventory.quantity = parsedQuantity;

      // If available wasn't explicitly supplied,
      // make sure it doesn't exceed the new quantity.
      if (
        available === undefined &&
        inventory.available > parsedQuantity
      ) {
        inventory.available = parsedQuantity;
      }
    }

    // ==================================================
    // AVAILABLE
    // ==================================================

    if (available !== undefined) {
      const parsedAvailable = Number(available);

      if (!Number.isFinite(parsedAvailable) || parsedAvailable < 0) {
        return res.status(400).json({
          success: false,
          message: "Available quantity must be a valid non-negative number",
        });
      }

      const currentQuantity = inventory.quantity;

      if (parsedAvailable > currentQuantity) {
        return res.status(400).json({
          success: false,
          message: "Available quantity cannot be greater than total quantity",
        });
      }

      inventory.available = parsedAvailable;
    }

    // ==================================================
    // MINIMUM STOCK
    // ==================================================

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

    // ==================================================
    // DESCRIPTION
    // ==================================================

    if (description !== undefined) {
      inventory.description = description?.trim() || "";
    }

    // ==================================================
    // STATUS
    // ==================================================

    inventory.status = calculateStatus(
      inventory.available,
      inventory.minimumStock,
    );

    // ==================================================
    // SAVE
    // ==================================================

    await inventory.save();

    // ==================================================
    // RETURN UPDATED INVENTORY
    // ==================================================

    const updatedInventory = await Inventory.findById(
      inventory._id,
    ).populate(
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

    // ==================================================
    // DUPLICATE KEY
    // ==================================================

    if (error.code === 11000) {
      const duplicateFields = Object.keys(
        error.keyPattern || error.keyValue || {},
      );

      if (duplicateFields.includes("itemCode")) {
        return res.status(409).json({
          success: false,
          message: `Item code "${error.keyValue?.itemCode || ""}" is already in use.`,
        });
      }

      return res.status(409).json({
        success: false,
        message: "A duplicate inventory value already exists.",
      });
    }

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
    const query = {
      _id: req.params.id,
    };

    if (!isAdmin(req)) {
      const departmentId = getAssignedDepartmentId(req);

      if (!departmentId) {
        return res.status(403).json({
          success: false,
          message: "No department is assigned to your account",
        });
      }

      // Department users can delete only items
      // belonging to their own department.
      query.department = departmentId;
    }

    const inventory = await Inventory.findOne(query);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    await Inventory.findByIdAndDelete(inventory._id);

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