import mongoose from "mongoose";

import Return from "../models/Return.js";
import Inventory from "../models/Inventory.js";
import Department from "../models/Department.js";
import StockOut from "../models/StockOut.js";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const RETURN_STATUSES = [
  "Completed",
  "Under Inspection",
  "Rejected",
];

const RETURN_CONDITIONS = [
  "Good",
  "Repair",
  "Damaged",
];

// --------------------------------------------------
// COMMON HELPERS
// --------------------------------------------------

const isAdmin = (req) =>
  req.user?.role?.toLowerCase() === "admin";

const getDocumentId = (value) => {
  if (!value) return null;
  return String(value._id || value);
};

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(String(value || ""));

const getAssignedDepartment = async (req) => {
  const departmentValue =
    req.user?.department?._id ||
    req.user?.department ||
    req.user?.departmentId;

  if (!departmentValue) return null;

  const value = String(departmentValue);

  if (isValidObjectId(value)) {
    const department = await Department.findById(value);
    if (department) return department;
  }

  return Department.findOne({ departmentId: value });
};

const inventoryBelongsToDepartment = (
  inventory,
  departmentId,
) =>
  getDocumentId(inventory.department) ===
  String(departmentId);

const calculateInventoryStatus = (
  available,
  minimumStock = 0,
) => {
  if (available <= 0) return "Out of Stock";

  if (available <= minimumStock) {
    return "Low Stock";
  }

  return "Available";
};

const populateReturn = (query) =>
  query
    .populate("department")
    .populate("inventory")
    .populate("stockOut");

const generateReturnNo = async () => {
  const year = new Date().getFullYear();
  const prefix = `RET-${year}-`;

  const lastReturn = await Return.findOne({
    returnNo: { $regex: `^${prefix}` },
  }).sort({ returnNo: -1 });

  let nextNumber = 1;

  if (lastReturn?.returnNo) {
    const lastNumber = Number(
      lastReturn.returnNo.split("-")[2],
    );

    if (Number.isFinite(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

const isValidDate = (value) => {
  return value && !Number.isNaN(new Date(value).getTime());
};

// --------------------------------------------------
// GET PREVIOUSLY RETURNED QUANTITY
//
// Completed and Under Inspection count.
// Rejected returns do not count.
// --------------------------------------------------

const getPreviouslyReturnedQuantity = async (
  stockOutId,
  excludeReturnId = null,
) => {
  const query = {
    stockOut: new mongoose.Types.ObjectId(
      String(stockOutId),
    ),
    status: {
      $in: ["Completed", "Under Inspection"],
    },
  };

  if (excludeReturnId) {
    query._id = {
      $ne: new mongoose.Types.ObjectId(
        String(excludeReturnId),
      ),
    };
  }

  const result = await Return.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalReturned: { $sum: "$quantity" },
      },
    },
  ]);

  return Number(result[0]?.totalReturned || 0);
};

// --------------------------------------------------
// VALIDATE RETURN AGAINST STOCK OUT
// --------------------------------------------------

const validateStockOutReturn = async ({
  stockOutId,
  inventoryId,
  departmentId,
  quantity,
  excludeReturnId = null,
}) => {
  if (!stockOutId) {
    return {
      valid: false,
      status: 400,
      message:
        "Please select the Stock Out record for this return",
    };
  }

  if (!isValidObjectId(stockOutId)) {
    return {
      valid: false,
      status: 400,
      message: "Invalid Stock Out record",
    };
  }

  const stockOutRecord =
    await StockOut.findById(stockOutId);

  if (!stockOutRecord) {
    return {
      valid: false,
      status: 404,
      message: "Stock Out record not found",
    };
  }

  if (
    getDocumentId(stockOutRecord.inventory) !==
    String(inventoryId)
  ) {
    return {
      valid: false,
      status: 400,
      message:
        "Selected Stock Out does not match the inventory item",
    };
  }

  if (
    getDocumentId(stockOutRecord.department) !==
    String(departmentId)
  ) {
    return {
      valid: false,
      status: 400,
      message:
        "Selected Stock Out does not belong to this department",
    };
  }

  const alreadyReturned =
    await getPreviouslyReturnedQuantity(
      stockOutRecord._id,
      excludeReturnId,
    );

  const issuedQuantity = Number(
    stockOutRecord.quantity,
  );

  const remainingQuantity = Math.max(
    0,
    issuedQuantity - alreadyReturned,
  );

  if (Number(quantity) > remainingQuantity) {
    return {
      valid: false,
      status: 400,
      message:
        `Only ${remainingQuantity} item(s) can be returned. ` +
        `Issued: ${issuedQuantity}, ` +
        `already returned: ${alreadyReturned}.`,
      issuedQuantity,
      alreadyReturned,
      remainingQuantity,
    };
  }

  return {
    valid: true,
    stockOutRecord,
    issuedQuantity,
    alreadyReturned,
    remainingQuantity,
  };
};

// --------------------------------------------------
// APPLY INVENTORY CHANGES
//
// Completed and Under Inspection add stock.
// Rejected does not add stock.
//
// On update, reverse the old return effect first,
// then apply the new return effect.
// --------------------------------------------------

const applyInventoryChanges = async ({
  oldInventoryId = null,
  oldQuantity = 0,
  oldStatus = "Rejected",

  newInventoryId = null,
  newQuantity = 0,
  newStatus = "Rejected",
}) => {
  const changes = new Map();

  // Reverse the old return.
  if (oldInventoryId && oldStatus !== "Rejected") {
    const id = String(oldInventoryId);

    changes.set(
      id,
      (changes.get(id) || 0) - Number(oldQuantity),
    );
  }

  // Apply the new return.
  if (newInventoryId && newStatus !== "Rejected") {
    const id = String(newInventoryId);

    changes.set(
      id,
      (changes.get(id) || 0) + Number(newQuantity),
    );
  }

  // Validate every affected inventory item first.
  const updates = [];

  for (const [inventoryId, difference] of changes) {
    if (difference === 0) continue;

    const inventoryItem =
      await Inventory.findById(inventoryId);

    if (!inventoryItem) {
      throw new Error(
        `Inventory item ${inventoryId} was not found`,
      );
    }

    const currentAvailable = Number(
      inventoryItem.available || 0,
    );

    const totalQuantity = Number(
      inventoryItem.quantity || 0,
    );

    const newAvailable =
      currentAvailable + difference;

    if (newAvailable < 0) {
      throw new Error(
        "Inventory adjustment would make available stock negative",
      );
    }

    if (newAvailable > totalQuantity) {
      throw new Error(
        "Returned quantity exceeds the total inventory quantity",
      );
    }

    updates.push({
      inventoryItem,
      newAvailable,
    });
  }

  // Save only after all affected items pass validation.
  for (const update of updates) {
    update.inventoryItem.available =
      update.newAvailable;

    update.inventoryItem.status =
      calculateInventoryStatus(
        update.newAvailable,
        Number(update.inventoryItem.minimumStock || 0),
      );

    await update.inventoryItem.save();
  }
};

// --------------------------------------------------
// GET ALL RETURNS
// --------------------------------------------------

export const getReturns = async (req, res) => {
  try {
    const admin = isAdmin(req);
    const query = {};

    let assignedDepartment = null;

    if (!admin) {
      assignedDepartment =
        await getAssignedDepartment(req);

      if (!assignedDepartment) {
        return res.status(403).json({
          success: false,
          message: "No department assigned to this user",
        });
      }

      query.department = assignedDepartment._id;
    }

    const {
      search,
      department,
      inventory,
      status,
      condition,
    } = req.query;

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");

      query.$or = [
        { returnNo: regex },
        { returnedBy: regex },
        { reason: regex },
        { remarks: regex },
      ];
    }

    if (admin && department && department !== "All") {
      if (!isValidObjectId(department)) {
        return res.status(400).json({
          success: false,
          message: "Invalid department ID",
        });
      }

      query.department = department;
    }

    if (inventory && inventory !== "All") {
      if (!isValidObjectId(inventory)) {
        return res.status(400).json({
          success: false,
          message: "Invalid inventory ID",
        });
      }

      query.inventory = inventory;
    }

    if (status && status !== "All") {
      if (!RETURN_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid return status",
        });
      }

      query.status = status;
    }

    if (condition && condition !== "All") {
      if (!RETURN_CONDITIONS.includes(condition)) {
        return res.status(400).json({
          success: false,
          message: "Invalid return condition",
        });
      }

      query.condition = condition;
    }

    const returns = await populateReturn(
      Return.find(query),
    ).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: returns.length,
      permissions: {
        canDelete: admin,
        canChooseDepartment: admin,
        departmentId: admin
          ? null
          : String(assignedDepartment._id),
      },
      returns,
    });
  } catch (error) {
    console.error("Get Returns Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch return records",
      error: error.message,
    });
  }
};

// --------------------------------------------------
// GET SINGLE RETURN
// --------------------------------------------------

export const getReturnById = async (req, res) => {
  try {
    const admin = isAdmin(req);

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return ID",
      });
    }

    const query = { _id: req.params.id };

    if (!admin) {
      const assignedDepartment =
        await getAssignedDepartment(req);

      if (!assignedDepartment) {
        return res.status(403).json({
          success: false,
          message: "No department assigned to this user",
        });
      }

      query.department = assignedDepartment._id;
    }

    const returnRecord = await populateReturn(
      Return.findOne(query),
    );

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: "Return record not found",
      });
    }

    return res.status(200).json({
      success: true,
      return: returnRecord,
    });
  } catch (error) {
    console.error("Get Return By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch return record",
      error: error.message,
    });
  }
};

// --------------------------------------------------
// CREATE RETURN
// --------------------------------------------------

export const createReturn = async (req, res) => {
  try {
    const admin = isAdmin(req);

    const {
      returnNo,
      department,
      inventory,
      stockOut,
      quantity,
      returnDate,
      returnedBy,
      condition,
      status = "Completed",
      receivedBy,
      reason,
      remarks,
    } = req.body;

    let finalDepartment = department;

    // Department users must use their assigned department.
    if (!admin) {
      const assignedDepartment =
        await getAssignedDepartment(req);

      if (!assignedDepartment) {
        return res.status(403).json({
          success: false,
          message: "No department assigned to this user",
        });
      }

      finalDepartment = assignedDepartment._id;
    }

    if (
      !finalDepartment ||
      !inventory ||
      quantity === undefined ||
      !returnDate ||
      !returnedBy?.trim() ||
      !condition ||
      !receivedBy?.trim() ||
      !reason?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (
      !isValidObjectId(finalDepartment) ||
      !isValidObjectId(inventory)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department or inventory ID",
      });
    }

    const returnQuantity = Number(quantity);

    if (
      !Number.isFinite(returnQuantity) ||
      returnQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Return quantity must be greater than zero",
      });
    }

    if (!isValidDate(returnDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return date",
      });
    }

    if (!RETURN_CONDITIONS.includes(condition)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return condition",
      });
    }

    if (!RETURN_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return status",
      });
    }

    const departmentExists =
      await Department.findById(finalDepartment);

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const inventoryItem =
      await Inventory.findById(inventory);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    if (
      !inventoryBelongsToDepartment(
        inventoryItem,
        finalDepartment,
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This inventory item does not belong to this department",
      });
    }

    const stockOutValidation =
      await validateStockOutReturn({
        stockOutId: stockOut,
        inventoryId: inventory,
        departmentId: finalDepartment,
        quantity: returnQuantity,
      });

    if (!stockOutValidation.valid) {
      return res.status(stockOutValidation.status).json({
        success: false,
        message: stockOutValidation.message,
        issuedQuantity: stockOutValidation.issuedQuantity,
        alreadyReturned: stockOutValidation.alreadyReturned,
        remainingQuantity: stockOutValidation.remainingQuantity,
      });
    }

    const finalReturnNo =
      returnNo?.trim() || (await generateReturnNo());

    const existingReturn = await Return.findOne({
      returnNo: finalReturnNo,
    });

    if (existingReturn) {
      return res.status(409).json({
        success: false,
        message: "Return number already exists",
      });
    }

    const newReturn = await Return.create({
      returnNo: finalReturnNo,
      department: finalDepartment,
      inventory,
      stockOut,
      quantity: returnQuantity,
      returnDate,
      returnedBy: returnedBy.trim(),
      condition,
      status,
      receivedBy: receivedBy.trim(),
      reason: reason.trim(),
      remarks: remarks?.trim() || "",
    });

    // Rejected returns do not increase available stock.
    if (status !== "Rejected") {
      await applyInventoryChanges({
        newInventoryId: inventory,
        newQuantity: returnQuantity,
        newStatus: status,
      });
    }

    const populatedReturn = await populateReturn(
      Return.findById(newReturn._id),
    );

    return res.status(201).json({
      success: true,
      message: "Return record created successfully",
      return: populatedReturn,
    });
  } catch (error) {
    console.error("Create Return Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create return record",
      error: error.message,
    });
  }
};

// --------------------------------------------------
// UPDATE RETURN
// --------------------------------------------------

export const updateReturn = async (req, res) => {
  try {
    const admin = isAdmin(req);

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return ID",
      });
    }

    const returnQuery = { _id: req.params.id };

    if (!admin) {
      const assignedDepartment =
        await getAssignedDepartment(req);

      if (!assignedDepartment) {
        return res.status(403).json({
          success: false,
          message: "No department assigned to this user",
        });
      }

      returnQuery.department = assignedDepartment._id;
    }

    const returnRecord =
      await Return.findOne(returnQuery);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: "Return record not found",
      });
    }

    const {
      returnNo,
      department,
      inventory,
      stockOut,
      quantity,
      returnDate,
      returnedBy,
      condition,
      status,
      receivedBy,
      reason,
      remarks,
    } = req.body;

    const finalDepartment = admin
      ? department || getDocumentId(returnRecord.department)
      : getDocumentId(returnRecord.department);

    const finalInventory =
      inventory || getDocumentId(returnRecord.inventory);

    const finalStockOut =
      stockOut !== undefined
        ? stockOut
        : getDocumentId(returnRecord.stockOut);

    const finalQuantity =
      quantity !== undefined
        ? Number(quantity)
        : Number(returnRecord.quantity);

    const finalReturnDate =
      returnDate || returnRecord.returnDate;

    const finalReturnedBy =
      returnedBy !== undefined
        ? String(returnedBy).trim()
        : returnRecord.returnedBy;

    const finalCondition =
      condition || returnRecord.condition;

    const finalStatus =
      status || returnRecord.status;

    const finalReceivedBy =
      receivedBy !== undefined
        ? String(receivedBy).trim()
        : returnRecord.receivedBy;

    const finalReason =
      reason !== undefined
        ? String(reason).trim()
        : returnRecord.reason;

    const finalRemarks =
      remarks !== undefined
        ? String(remarks).trim()
        : returnRecord.remarks;

    if (
      !finalDepartment ||
      !finalInventory ||
      !finalReturnDate ||
      !finalReturnedBy ||
      !finalReceivedBy ||
      !finalReason
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (
      !isValidObjectId(finalDepartment) ||
      !isValidObjectId(finalInventory)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department or inventory ID",
      });
    }

    if (
      !Number.isFinite(finalQuantity) ||
      finalQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Return quantity must be greater than zero",
      });
    }

    if (!isValidDate(finalReturnDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return date",
      });
    }

    if (!RETURN_CONDITIONS.includes(finalCondition)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return condition",
      });
    }

    if (!RETURN_STATUSES.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return status",
      });
    }

    const departmentExists =
      await Department.findById(finalDepartment);

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const newInventory =
      await Inventory.findById(finalInventory);

    if (!newInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    if (
      !inventoryBelongsToDepartment(
        newInventory,
        finalDepartment,
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This inventory item does not belong to this department",
      });
    }

    const stockOutValidation =
      await validateStockOutReturn({
        stockOutId: finalStockOut,
        inventoryId: finalInventory,
        departmentId: finalDepartment,
        quantity: finalQuantity,
        excludeReturnId: returnRecord._id,
      });

    if (!stockOutValidation.valid) {
      return res.status(stockOutValidation.status).json({
        success: false,
        message: stockOutValidation.message,
        issuedQuantity: stockOutValidation.issuedQuantity,
        alreadyReturned: stockOutValidation.alreadyReturned,
        remainingQuantity: stockOutValidation.remainingQuantity,
      });
    }

    const finalReturnNo =
      returnNo?.trim() || returnRecord.returnNo;

    const duplicateReturn = await Return.findOne({
      returnNo: finalReturnNo,
      _id: { $ne: returnRecord._id },
    });

    if (duplicateReturn) {
      return res.status(409).json({
        success: false,
        message: "Return number already exists",
      });
    }

    // Reverse the old stock effect and apply the new one.
    await applyInventoryChanges({
      oldInventoryId: getDocumentId(
        returnRecord.inventory,
      ),
      oldQuantity: Number(returnRecord.quantity),
      oldStatus: returnRecord.status,

      newInventoryId: finalInventory,
      newQuantity: finalQuantity,
      newStatus: finalStatus,
    });

    returnRecord.returnNo = finalReturnNo;
    returnRecord.department = finalDepartment;
    returnRecord.inventory = finalInventory;
    returnRecord.stockOut = finalStockOut;
    returnRecord.quantity = finalQuantity;
    returnRecord.returnDate = finalReturnDate;
    returnRecord.returnedBy = finalReturnedBy;
    returnRecord.condition = finalCondition;
    returnRecord.status = finalStatus;
    returnRecord.receivedBy = finalReceivedBy;
    returnRecord.reason = finalReason;
    returnRecord.remarks = finalRemarks;

    await returnRecord.save();

    const updatedReturn = await populateReturn(
      Return.findById(returnRecord._id),
    );

    return res.status(200).json({
      success: true,
      message: "Return record updated successfully",
      return: updatedReturn,
    });
  } catch (error) {
    console.error("Update Return Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update return record",
      error: error.message,
    });
  }
};

// --------------------------------------------------
// DELETE RETURN
// ADMIN ONLY
// --------------------------------------------------

export const deleteReturn = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message:
          "Only administrators can delete return records",
      });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return ID",
      });
    }

    const returnRecord =
      await Return.findById(req.params.id);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: "Return record not found",
      });
    }

    // Reverse inventory changes only for accepted returns.
    if (returnRecord.status !== "Rejected") {
      await applyInventoryChanges({
        oldInventoryId: getDocumentId(
          returnRecord.inventory,
        ),
        oldQuantity: Number(returnRecord.quantity),
        oldStatus: returnRecord.status,
      });
    }

    await Return.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Return record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Return Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete return record",
      error: error.message,
    });
  }
};