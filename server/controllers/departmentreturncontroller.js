import mongoose from "mongoose";
import Return from "../models/Return.js";
import Inventory from "../models/Inventory.js";
import StockOut from "../models/StockOut.js";

// ======================================================
// HELPERS
// ======================================================

const POPULATE_DEPARTMENT = "name departmentName code";
const POPULATE_INVENTORY =
  "itemCode name category unit quantity available minimumStock status";
const POPULATE_STOCK_OUT = "stockOutNo issuedDate issuedTo quantity";

const getUserDepartmentId = (req) => {
  const dept = req.user?.department?._id || req.user?.department;
  return dept ? String(dept) : null;
};

const generateReturnNo = async () => {
  const year = new Date().getFullYear();
  const prefix = `RET-${year}-`;

  const lastReturn = await Return.findOne({
    returnNo: { $regex: `^${prefix}` },
  })
    .sort({ returnNo: -1 })
    .select("returnNo");

  if (!lastReturn) return `${prefix}001`;

  const lastNumber = Number(lastReturn.returnNo.replace(prefix, "")) || 0;

  return `${prefix}${String(lastNumber + 1).padStart(3, "0")}`;
};

const calculateInventoryStatus = (available, minimumStock = 0) => {
  if (available <= 0) return "Out of Stock";
  if (available <= minimumStock) return "Low Stock";
  return "Available";
};

// Quantity of a stock-out already returned (or awaiting inspection).
// Rejected returns do not count.
const getReturnedQuantity = async (stockOutId, excludeReturnId = null) => {
  const match = {
    stockOut: new mongoose.Types.ObjectId(stockOutId),
    status: { $ne: "Rejected" },
  };

  if (excludeReturnId) {
    match._id = { $ne: new mongoose.Types.ObjectId(excludeReturnId) };
  }

  const result = await Return.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$quantity" } } },
  ]);

  return result[0]?.total || 0;
};

const populateReturn = (query) =>
  query
    .populate("department", POPULATE_DEPARTMENT)
    .populate("inventory", POPULATE_INVENTORY)
    .populate("stockOut", POPULATE_STOCK_OUT);

// ======================================================
// GET MY DEPARTMENT'S RETURNS
// GET /api/department-returns
// ======================================================

export const getMyDepartmentReturns = async (req, res) => {
  try {
    const departmentId = getUserDepartmentId(req);

    if (!departmentId) {
      return res.status(404).json({
        success: false,
        message: "No department assigned to this user",
      });
    }

    const { status = "All", search = "" } = req.query;

    const query = { department: departmentId };

    if (status !== "All") {
      query.status = status;
    }

    if (search.trim()) {
      const regex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      query.$or = [{ returnNo: regex }, { returnedBy: regex }, { reason: regex }];
    }

    const returns = await populateReturn(
      Return.find(query).sort({ createdAt: -1 }),
    );

    res.status(200).json({
      success: true,
      count: returns.length,
      returns,
    });
  } catch (error) {
    console.error("Get department returns error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch return records",
    });
  }
};

// ======================================================
// GET ITEMS ISSUED TO MY DEPARTMENT THAT CAN BE RETURNED
// GET /api/department-returns/issued-items
// ======================================================

export const getReturnableItems = async (req, res) => {
  try {
    const departmentId = getUserDepartmentId(req);

    if (!departmentId) {
      return res.status(404).json({
        success: false,
        message: "No department assigned to this user",
      });
    }

    const stockOuts = await StockOut.find({ department: departmentId })
      .populate("inventory", POPULATE_INVENTORY)
      .sort({ issuedDate: -1 })
      .lean();

    if (stockOuts.length === 0) {
      return res.status(200).json({ success: true, count: 0, items: [] });
    }

    // Sum non-rejected returns per stock-out in one query
    const returned = await Return.aggregate([
      {
        $match: {
          stockOut: { $in: stockOuts.map((s) => s._id) },
          status: { $ne: "Rejected" },
        },
      },
      { $group: { _id: "$stockOut", total: { $sum: "$quantity" } } },
    ]);

    const returnedMap = new Map(returned.map((r) => [String(r._id), r.total]));

    const items = stockOuts
      .map((stockOut) => {
        const returnedQuantity = returnedMap.get(String(stockOut._id)) || 0;

        return {
          stockOutId: stockOut._id,
          stockOutNo: stockOut.stockOutNo,
          issuedDate: stockOut.issuedDate,
          issuedTo: stockOut.issuedTo,
          inventory: stockOut.inventory,
          issuedQuantity: stockOut.quantity,
          returnedQuantity,
          returnableQuantity: Math.max(stockOut.quantity - returnedQuantity, 0),
        };
      })
      .filter((item) => item.returnableQuantity > 0 && item.inventory);

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get returnable items error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch returnable items",
    });
  }
};

// ======================================================
// CREATE RETURN (DEPARTMENT)
// POST /api/department-returns
//
// Creates the record as "Under Inspection".
// Inventory is NOT changed until an admin accepts it.
// ======================================================

export const createDepartmentReturn = async (req, res) => {
  try {
    const departmentId = getUserDepartmentId(req);

    if (!departmentId) {
      return res.status(404).json({
        success: false,
        message: "No department assigned to this user",
      });
    }

    const { stockOut, quantity, returnDate, returnedBy, condition, reason, remarks } =
      req.body;

    // -------------------------
    // VALIDATION
    // -------------------------

    if (!stockOut || !mongoose.Types.ObjectId.isValid(stockOut)) {
      return res.status(400).json({
        success: false,
        message: "Please select an issued item to return",
      });
    }

    if (!returnDate) {
      return res.status(400).json({
        success: false,
        message: "Return date is required",
      });
    }

    if (!returnedBy?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Returned By is required",
      });
    }

    if (!reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Return reason is required",
      });
    }

    if (!["Good", "Repair", "Damaged"].includes(condition)) {
      return res.status(400).json({
        success: false,
        message: "Condition must be Good, Repair, or Damaged",
      });
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number greater than zero",
      });
    }

    // -------------------------
    // STOCK OUT MUST BELONG TO USER'S DEPARTMENT
    // -------------------------

    const stockOutDoc = await StockOut.findById(stockOut);

    if (!stockOutDoc) {
      return res.status(404).json({
        success: false,
        message: "Stock Out record not found",
      });
    }

    if (String(stockOutDoc.department) !== departmentId) {
      return res.status(403).json({
        success: false,
        message: "This item was not issued to your department",
      });
    }

    // -------------------------
    // QUANTITY CHECK
    // -------------------------

    const alreadyReturned = await getReturnedQuantity(stockOutDoc._id);
    const returnable = stockOutDoc.quantity - alreadyReturned;

    if (returnable <= 0) {
      return res.status(400).json({
        success: false,
        message: "This issued item has already been fully returned",
      });
    }

    if (parsedQuantity > returnable) {
      return res.status(400).json({
        success: false,
        message: `You can return at most ${returnable} unit(s) of this item`,
      });
    }

    // -------------------------
    // CREATE
    // -------------------------

    const returnNo = await generateReturnNo();

    const created = await Return.create({
      returnNo,
      inventory: stockOutDoc.inventory,
      department: departmentId,
      quantity: parsedQuantity,
      returnDate,
      returnedBy: returnedBy.trim(),
      condition,
      reason: reason.trim(),
      stockOut: stockOutDoc._id,
      status: "Under Inspection",
      receivedBy: "Pending inspection",
      remarks: remarks?.trim() || "",
    });

    const populated = await populateReturn(Return.findById(created._id));

    res.status(201).json({
      success: true,
      message: "Return submitted. It will be added to stock once an admin accepts it.",
      return: populated,
    });
  } catch (error) {
    console.error("Create department return error:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to submit return",
    });
  }
};

// ======================================================
// CANCEL MY PENDING RETURN
// DELETE /api/department-returns/:id
// ======================================================

export const cancelDepartmentReturn = async (req, res) => {
  try {
    const departmentId = getUserDepartmentId(req);

    const returnRecord = await Return.findById(req.params.id);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: "Return record not found",
      });
    }

    if (String(returnRecord.department) !== departmentId) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own department's returns",
      });
    }

    if (returnRecord.status !== "Under Inspection") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a return that is already ${returnRecord.status.toLowerCase()}`,
      });
    }

    // Under Inspection returns never touched inventory, so just delete.
    await Return.findByIdAndDelete(returnRecord._id);

    res.status(200).json({
      success: true,
      message: "Return cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel department return error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel return",
    });
  }
};

// ======================================================
// ADMIN: ACCEPT RETURN
// PATCH /api/department-returns/:id/accept
// ======================================================

export const acceptDepartmentReturn = async (req, res) => {
  try {
    const returnRecord = await Return.findById(req.params.id);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: "Return record not found",
      });
    }

    if (returnRecord.status !== "Under Inspection") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept a return that is already ${returnRecord.status.toLowerCase()}`,
      });
    }

    const inventory = await Inventory.findById(returnRecord.inventory);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    inventory.available = Math.min(
      Number(inventory.available || 0) + returnRecord.quantity,
      inventory.quantity,
    );

    inventory.status = calculateInventoryStatus(
      inventory.available,
      inventory.minimumStock,
    );

    await inventory.save();

    returnRecord.status = "Completed";
    returnRecord.receivedBy = req.user?.name || "Admin";

    await returnRecord.save();

    const populated = await populateReturn(Return.findById(returnRecord._id));

    res.status(200).json({
      success: true,
      message: "Return accepted and stock updated",
      return: populated,
    });
  } catch (error) {
    console.error("Accept return error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to accept return",
    });
  }
};

// ======================================================
// ADMIN: REJECT RETURN
// PATCH /api/department-returns/:id/reject
// ======================================================

export const rejectDepartmentReturn = async (req, res) => {
  try {
    const returnRecord = await Return.findById(req.params.id);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: "Return record not found",
      });
    }

    if (returnRecord.status !== "Under Inspection") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a return that is already ${returnRecord.status.toLowerCase()}`,
      });
    }

    returnRecord.status = "Rejected";
    returnRecord.receivedBy = req.user?.name || "Admin";

    if (req.body?.reason?.trim()) {
      returnRecord.remarks = [returnRecord.remarks, `Rejected: ${req.body.reason.trim()}`]
        .filter(Boolean)
        .join(" | ");
    }

    await returnRecord.save();

    const populated = await populateReturn(Return.findById(returnRecord._id));

    res.status(200).json({
      success: true,
      message: "Return rejected",
      return: populated,
    });
  } catch (error) {
    console.error("Reject return error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reject return",
    });
  }
};