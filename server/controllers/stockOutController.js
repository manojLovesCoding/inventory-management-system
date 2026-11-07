
import StockOut from "../models/StockOut.js";
import Inventory from "../models/Inventory.js";
import Department from "../models/Department.js";
import ItemRequest from "../models/ItemRequest.js";
import Return from "../models/Return.js";

// ======================================================
// HELPERS
// ======================================================

// Check whether the logged-in user is an admin.
const isAdmin = (req) => {
  return req.user?.role?.toLowerCase() === "admin";
};

// Get the department ID assigned to the logged-in user.
const getAssignedDepartmentId = (req) => {
  const department =
    req.user?.department?._id ||
    req.user?.department ||
    req.user?.departmentId;

  return department?.toString() || "";
};

// Get the ID from either a populated object or an ID.
const getDocumentId = (value) => {
  if (!value) return "";

  if (typeof value === "object" && value._id) {
    return value._id.toString();
  }

  return value.toString();
};

// Check whether a Stock Out belongs to the user's department.
const belongsToUserDepartment = (stockOut, departmentId) => {
  return (
    getDocumentId(stockOut.department) ===
    departmentId.toString()
  );
};

// Check whether inventory belongs to the selected department.
// If the Inventory model has a department field, validate it.
const inventoryBelongsToDepartment = (
  inventory,
  departmentId
) => {
  if (!inventory.department) {
    return true;
  }

  return (
    getDocumentId(inventory.department) ===
    departmentId.toString()
  );
};

// Populate Stock Out response.
const populateStockOut = (query) => {
  return query
    .populate("department", "name departmentName code")
    .populate(
      "inventory",
      "itemCode name category unit quantity available minimumStock status department"
    )
    .populate("request", "requestNo status");
};

// ======================================================
// GENERATE STOCK OUT NUMBER
// ======================================================

const generateStockOutNo = async () => {
  const year = new Date().getFullYear();

  const prefix = `STO-${year}-`;

  const lastStockOut = await StockOut.findOne({
    stockOutNo: {
      $regex: `^${prefix}`,
    },
  })
    .sort({ stockOutNo: -1 })
    .select("stockOutNo");

  if (!lastStockOut) {
    return `${prefix}001`;
  }

  const lastNumber = Number(
    lastStockOut.stockOutNo.replace(prefix, "")
  );

  return `${prefix}${String(lastNumber + 1).padStart(3, "0")}`;
};

// ======================================================
// CALCULATE INVENTORY STATUS
// ======================================================

const calculateInventoryStatus = (
  available,
  minimumStock = 0
) => {
  if (available <= 0) {
    return "Out of Stock";
  }

  if (available <= minimumStock) {
    return "Low Stock";
  }

  return "Available";
};

// ======================================================
// GET ALL STOCK OUT
// ======================================================

export const getStockOuts = async (req, res) => {
  try {
    const {
      search = "",
      department = "All",
      inventory = "All",
    } = req.query;

    const query = {};

    // Department users can only see their own department.
    if (!isAdmin(req)) {
      const departmentId = getAssignedDepartmentId(req);

      if (!departmentId) {
        return res.status(403).json({
          success: false,
          message: "No department assigned to this user",
        });
      }

      query.department = departmentId;
    } else if (department !== "All") {
      // Admin can filter by any department.
      query.department = department;
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      query.$or = [
        { stockOutNo: regex },
        { issuedTo: regex },
        { notes: regex },
      ];
    }

    if (inventory !== "All") {
      query.inventory = inventory;
    }

    const stockOuts = await populateStockOut(
      StockOut.find(query).sort({ createdAt: -1 })
    );

    return res.status(200).json({
      success: true,
      count: stockOuts.length,
      stockOuts,
    });
  } catch (error) {
    console.error("Get stock out error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock out records",
    });
  }
};

// ======================================================
// GET SINGLE STOCK OUT
// ======================================================

export const getStockOutById = async (req, res) => {
  try {
    const stockOut = await populateStockOut(
      StockOut.findById(req.params.id)
    );

    if (!stockOut) {
      return res.status(404).json({
        success: false,
        message: "Stock Out record not found",
      });
    }

    // Department users cannot view another department's record.
    if (!isAdmin(req)) {
      const departmentId = getAssignedDepartmentId(req);

      if (
        !departmentId ||
        !belongsToUserDepartment(stockOut, departmentId)
      ) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to view this Stock Out record",
        });
      }
    }

    return res.status(200).json({
      success: true,
      stockOut,
    });
  } catch (error) {
    console.error("Get stock out error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Stock Out record",
    });
  }
};

// ======================================================
// CREATE STOCK OUT
// ======================================================

export const createStockOut = async (req, res) => {
  try {
    const {
      stockOutNo,
      department,
      inventory,
      quantity,
      issuedDate,
      issuedTo,
      request,
      notes,
    } = req.body;

    // Department users must use their assigned department.
    let finalDepartment = department;

    if (!isAdmin(req)) {
      const departmentId = getAssignedDepartmentId(req);

      if (!departmentId) {
        return res.status(403).json({
          success: false,
          message: "No department assigned to this user",
        });
      }

      finalDepartment = departmentId;
    }

    // -------------------------
    // VALIDATION
    // -------------------------

    if (!finalDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    if (!inventory) {
      return res.status(400).json({
        success: false,
        message: "Inventory item is required",
      });
    }

    if (!issuedDate) {
      return res.status(400).json({
        success: false,
        message: "Issue date is required",
      });
    }

    if (!issuedTo?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Issued To is required",
      });
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    // -------------------------
    // CHECK DEPARTMENT
    // -------------------------

    const departmentExists = await Department.findById(
      finalDepartment
    );

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // -------------------------
    // CHECK INVENTORY
    // -------------------------

    const inventoryItem = await Inventory.findById(inventory);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    if (
      !inventoryBelongsToDepartment(
        inventoryItem,
        finalDepartment
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "This inventory item does not belong to this department",
      });
    }

    // -------------------------
    // CHECK AVAILABLE STOCK
    // -------------------------

    if (parsedQuantity > inventoryItem.available) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available quantity is ${inventoryItem.available}`,
      });
    }

    // -------------------------
    // CHECK REQUEST
    // -------------------------

    if (request) {
      const requestExists = await ItemRequest.findById(request);

      if (!requestExists) {
        return res.status(404).json({
          success: false,
          message: "Item request not found",
        });
      }
    }

    // -------------------------
    // STOCK OUT NUMBER
    // -------------------------

    let finalStockOutNo = stockOutNo?.trim();

    if (!finalStockOutNo) {
      finalStockOutNo = await generateStockOutNo();
    }

    const duplicate = await StockOut.findOne({
      stockOutNo: finalStockOutNo,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Stock Out number already exists",
      });
    }

    // -------------------------
    // CREATE STOCK OUT
    // -------------------------

    const stockOut = await StockOut.create({
      stockOutNo: finalStockOutNo,
      department: finalDepartment,
      inventory,
      quantity: parsedQuantity,
      issuedDate,
      issuedTo: issuedTo.trim(),
      request: request || null,
      notes: notes?.trim() || "",
    });

    // -------------------------
    // UPDATE INVENTORY
    // -------------------------

    inventoryItem.available -= parsedQuantity;

    inventoryItem.status = calculateInventoryStatus(
      inventoryItem.available,
      inventoryItem.minimumStock
    );

    await inventoryItem.save();

    // -------------------------
    // RESPONSE
    // -------------------------

    const populatedStockOut = await populateStockOut(
      StockOut.findById(stockOut._id)
    );

    return res.status(201).json({
      success: true,
      message: "Stock Out created successfully",
      stockOut: populatedStockOut,
    });
  } catch (error) {
    console.error("Create stock out error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create Stock Out",
    });
  }
};

// ======================================================
// UPDATE STOCK OUT
// ======================================================

export const updateStockOut = async (req, res) => {
  try {
    const stockOut = await StockOut.findById(req.params.id);

    if (!stockOut) {
      return res.status(404).json({
        success: false,
        message: "Stock Out record not found",
      });
    }

    // -------------------------
    // CHECK DEPARTMENT ACCESS
    // -------------------------

    if (!isAdmin(req)) {
      const departmentId = getAssignedDepartmentId(req);

      if (
        !departmentId ||
        !belongsToUserDepartment(stockOut, departmentId)
      ) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to update this Stock Out record",
        });
      }
    }

    // -------------------------
    // PREVENT UPDATE IF RETURN EXISTS
    // -------------------------

    const linkedReturn = await Return.findOne({
      stockOut: stockOut._id,
    });

    if (linkedReturn) {
      return res.status(400).json({
        success: false,
        message:
          "This Stock Out record cannot be updated because a return is already linked to it. Please manage the return record first.",
      });
    }

    const {
      stockOutNo,
      department,
      inventory,
      quantity,
      issuedDate,
      issuedTo,
      request,
      notes,
    } = req.body;

    // Department users cannot change their assigned department.
    let finalDepartment = department;

    if (!isAdmin(req)) {
      finalDepartment = getAssignedDepartmentId(req);
    }

    if (!finalDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    if (!inventory) {
      return res.status(400).json({
        success: false,
        message: "Inventory item is required",
      });
    }

    if (!issuedDate) {
      return res.status(400).json({
        success: false,
        message: "Issue date is required",
      });
    }

    if (!issuedTo?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Issued To is required",
      });
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    // -------------------------
    // CHECK DEPARTMENT
    // -------------------------

    const departmentExists = await Department.findById(
      finalDepartment
    );

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // -------------------------
    // CHECK REQUEST
    // -------------------------

    if (request) {
      const requestExists = await ItemRequest.findById(request);

      if (!requestExists) {
        return res.status(404).json({
          success: false,
          message: "Item request not found",
        });
      }
    }

    // -------------------------
    // CHECK STOCK OUT NUMBER
    // -------------------------

    const finalStockOutNo =
      stockOutNo?.trim() || stockOut.stockOutNo;

    const duplicate = await StockOut.findOne({
      stockOutNo: finalStockOutNo,
      _id: { $ne: stockOut._id },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Stock Out number already exists",
      });
    }

    // -------------------------
    // GET OLD AND NEW INVENTORY
    // -------------------------

    const oldInventory = await Inventory.findById(
      stockOut.inventory
    );

    const newInventory = await Inventory.findById(inventory);

    if (!newInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    if (
      !inventoryBelongsToDepartment(
        newInventory,
        finalDepartment
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "This inventory item does not belong to this department",
      });
    }

    if (!oldInventory) {
      return res.status(404).json({
        success: false,
        message: "Original inventory item not found",
      });
    }

    // -------------------------
    // RESTORE OLD INVENTORY
    // -------------------------

    oldInventory.available += stockOut.quantity;

    if (oldInventory.available > oldInventory.quantity) {
      oldInventory.available = oldInventory.quantity;
    }

    // -------------------------
    // CHECK NEW AVAILABLE STOCK
    // -------------------------

    // If it is the same inventory item, the old issued
    // quantity has already been restored in memory.
    const availableForNewIssue =
      oldInventory._id.toString() === newInventory._id.toString()
        ? oldInventory.available
        : newInventory.available;

    if (parsedQuantity > availableForNewIssue) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available quantity is ${availableForNewIssue}`,
      });
    }

    // -------------------------
    // APPLY NEW STOCK OUT
    // -------------------------

    if (
      oldInventory._id.toString() === newInventory._id.toString()
    ) {
      oldInventory.available -= parsedQuantity;

      oldInventory.status = calculateInventoryStatus(
        oldInventory.available,
        oldInventory.minimumStock
      );

      await oldInventory.save();
    } else {
      // Save restored stock for the old item.
      oldInventory.status = calculateInventoryStatus(
        oldInventory.available,
        oldInventory.minimumStock
      );

      await oldInventory.save();

      // Deduct stock from the new item.
      newInventory.available -= parsedQuantity;

      newInventory.status = calculateInventoryStatus(
        newInventory.available,
        newInventory.minimumStock
      );

      await newInventory.save();
    }

    // -------------------------
    // UPDATE RECORD
    // -------------------------

    stockOut.stockOutNo = finalStockOutNo;
    stockOut.department = finalDepartment;
    stockOut.inventory = inventory;
    stockOut.quantity = parsedQuantity;
    stockOut.issuedDate = issuedDate;
    stockOut.issuedTo = issuedTo.trim();
    stockOut.request = request || null;
    stockOut.notes = notes?.trim() || "";

    await stockOut.save();

    // -------------------------
    // RESPONSE
    // -------------------------

    const updatedStockOut = await populateStockOut(
      StockOut.findById(stockOut._id)
    );

    return res.status(200).json({
      success: true,
      message: "Stock Out updated successfully",
      stockOut: updatedStockOut,
    });
  } catch (error) {
    console.error("Update stock out error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update Stock Out",
    });
  }
};

// ======================================================
// DELETE STOCK OUT
// ADMIN ONLY
// ======================================================

export const deleteStockOut = async (req, res) => {
  try {
    // Only admin can delete Stock Out records.
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete Stock Out records",
      });
    }

    const stockOut = await StockOut.findById(req.params.id);

    if (!stockOut) {
      return res.status(404).json({
        success: false,
        message: "Stock Out record not found",
      });
    }

    // -------------------------
    // PREVENT DELETE IF RETURN EXISTS
    // -------------------------

    const linkedReturn = await Return.findOne({
      stockOut: stockOut._id,
    });

    if (linkedReturn) {
      return res.status(400).json({
        success: false,
        message:
          "This Stock Out record cannot be deleted because a return is already linked to it. Please manage the return record first.",
      });
    }

    // -------------------------
    // RESTORE INVENTORY
    // -------------------------

    const inventory = await Inventory.findById(
      stockOut.inventory
    );

    if (inventory) {
      inventory.available += stockOut.quantity;

      if (inventory.available > inventory.quantity) {
        inventory.available = inventory.quantity;
      }

      inventory.status = calculateInventoryStatus(
        inventory.available,
        inventory.minimumStock
      );

      await inventory.save();
    }

    // -------------------------
    // DELETE
    // -------------------------

    await StockOut.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Stock Out deleted successfully",
    });
  } catch (error) {
    console.error("Delete stock out error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete Stock Out",
    });
  }
};
