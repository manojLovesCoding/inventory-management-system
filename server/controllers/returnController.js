import Return from "../models/Return.js";
import Inventory from "../models/Inventory.js";
import Department from "../models/Department.js";
import StockOut from "../models/StockOut.js";

// ======================================================
// GENERATE RETURN NUMBER
// ======================================================

const generateReturnNo = async () => {
  const year = new Date().getFullYear();

  const prefix = `RET-${year}-`;

  const lastReturn = await Return.findOne({
    returnNo: {
      $regex: `^${prefix}`,
    },
  })
    .sort({ returnNo: -1 })
    .select("returnNo");

  if (!lastReturn) {
    return `${prefix}001`;
  }

  const lastNumber = Number(
    lastReturn.returnNo.replace(prefix, "")
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
// GET ALL RETURNS
// ======================================================

export const getReturns = async (req, res) => {
  try {
    const {
      search = "",
      department = "All",
      inventory = "All",
      status = "All",
      condition = "All",
    } = req.query;

    const query = {};

    // -------------------------
    // SEARCH
    // -------------------------

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      query.$or = [
        { returnNo: regex },
        { returnedBy: regex },
        { reason: regex },
        { remarks: regex },
        { receivedBy: regex },
      ];
    }

    // -------------------------
    // FILTERS
    // -------------------------

    if (department !== "All") {
      query.department = department;
    }

    if (inventory !== "All") {
      query.inventory = inventory;
    }

    if (status !== "All") {
      query.status = status;
    }

    if (condition !== "All") {
      query.condition = condition;
    }

    // -------------------------
    // GET RETURNS
    // -------------------------

    const returns = await Return.find(query)
      .populate(
        "department",
        "name departmentName code"
      )
      .populate(
        "inventory",
        "itemCode name category unit quantity available minimumStock status"
      )
      .populate(
        "stockOut",
        "stockOutNo issuedDate issuedTo quantity"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: returns.length,
      returns,
    });
  } catch (error) {
    console.error("Get returns error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch return records",
    });
  }
};

// ======================================================
// GET SINGLE RETURN
// ======================================================

export const getReturnById = async (req, res) => {
  try {
    const returnRecord = await Return.findById(
      req.params.id
    )
      .populate(
        "department",
        "name departmentName code"
      )
      .populate(
        "inventory",
        "itemCode name category unit quantity available minimumStock status"
      )
      .populate(
        "stockOut",
        "stockOutNo issuedDate issuedTo quantity"
      );

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: "Return record not found",
      });
    }

    res.status(200).json({
      success: true,
      return: returnRecord,
    });
  } catch (error) {
    console.error("Get return error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch return record",
    });
  }
};

// ======================================================
// CREATE RETURN
// ======================================================

export const createReturn = async (req, res) => {
  try {
    const {
      returnNo,
      inventory,
      department,
      quantity,
      returnDate,
      returnedBy,
      condition,
      reason,
      stockOut,
      status,
      receivedBy,
      remarks,
    } = req.body;

    // -------------------------
    // VALIDATION
    // -------------------------

    if (!inventory) {
      return res.status(400).json({
        success: false,
        message: "Inventory item is required",
      });
    }

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
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

    if (!receivedBy?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Received By is required",
      });
    }

    if (
      !["Good", "Repair", "Damaged"].includes(
        condition
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Condition must be Good, Repair, or Damaged",
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

    const departmentExists =
      await Department.findById(department);

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // -------------------------
    // CHECK INVENTORY
    // -------------------------

    const inventoryItem =
      await Inventory.findById(inventory);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // -------------------------
    // CHECK STOCK OUT
    // -------------------------

    if (stockOut) {
      const stockOutExists =
        await StockOut.findById(stockOut);

      if (!stockOutExists) {
        return res.status(404).json({
          success: false,
          message: "Stock Out record not found",
        });
      }

      if (
        stockOutExists.inventory.toString() !==
        inventory.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Stock Out inventory does not match the returned inventory item",
        });
      }

      if (
        parsedQuantity >
        stockOutExists.quantity
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Return quantity cannot exceed the Stock Out quantity",
        });
      }
    }

    // -------------------------
    // RETURN NUMBER
    // -------------------------

    let finalReturnNo =
      returnNo?.trim();

    if (!finalReturnNo) {
      finalReturnNo =
        await generateReturnNo();
    }

    const duplicate =
      await Return.findOne({
        returnNo: finalReturnNo,
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Return number already exists",
      });
    }

    // -------------------------
    // CREATE RETURN
    // -------------------------

    const returnRecord =
      await Return.create({
        returnNo: finalReturnNo,
        inventory,
        department,
        quantity: parsedQuantity,
        returnDate,
        returnedBy: returnedBy.trim(),
        condition,
        reason: reason.trim(),
        stockOut: stockOut || null,
        status: status || "Completed",
        receivedBy: receivedBy.trim(),
        remarks: remarks?.trim() || "",
      });

    // -------------------------
    // UPDATE INVENTORY
    // -------------------------

    // A rejected return should not be added
    // back into usable inventory.

    if (status !== "Rejected") {
      inventoryItem.available +=
        parsedQuantity;

      if (
        inventoryItem.available >
        inventoryItem.quantity
      ) {
        inventoryItem.available =
          inventoryItem.quantity;
      }

      inventoryItem.status =
        calculateInventoryStatus(
          inventoryItem.available,
          inventoryItem.minimumStock
        );

      await inventoryItem.save();
    }

    // -------------------------
    // POPULATE RESPONSE
    // -------------------------

    const populatedReturn =
      await Return.findById(
        returnRecord._id
      )
        .populate(
          "department",
          "name departmentName code"
        )
        .populate(
          "inventory",
          "itemCode name category unit quantity available minimumStock status"
        )
        .populate(
          "stockOut",
          "stockOutNo issuedDate issuedTo quantity"
        );

    res.status(201).json({
      success: true,
      message: "Return created successfully",
      return: populatedReturn,
    });
  } catch (error) {
    console.error(
      "Create return error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create return",
    });
  }
};

// ======================================================
// UPDATE RETURN
// ======================================================

export const updateReturn = async (req, res) => {
  try {
    const returnRecord =
      await Return.findById(req.params.id);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: "Return record not found",
      });
    }

    const {
      returnNo,
      inventory,
      department,
      quantity,
      returnDate,
      returnedBy,
      condition,
      reason,
      stockOut,
      status,
      receivedBy,
      remarks,
    } = req.body;

    // -------------------------
    // VALIDATION
    // -------------------------

    if (!inventory) {
      return res.status(400).json({
        success: false,
        message: "Inventory item is required",
      });
    }

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
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

    if (!receivedBy?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Received By is required",
      });
    }

    if (
      !["Good", "Repair", "Damaged"].includes(
        condition
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Condition must be Good, Repair, or Damaged",
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

    const departmentExists =
      await Department.findById(department);

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // -------------------------
    // CHECK STOCK OUT
    // -------------------------

    if (stockOut) {
      const stockOutExists =
        await StockOut.findById(stockOut);

      if (!stockOutExists) {
        return res.status(404).json({
          success: false,
          message: "Stock Out record not found",
        });
      }

      if (
        stockOutExists.inventory.toString() !==
        inventory.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Stock Out inventory does not match the returned inventory item",
        });
      }

      if (
        parsedQuantity >
        stockOutExists.quantity
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Return quantity cannot exceed the Stock Out quantity",
        });
      }
    }

    // -------------------------
    // RETURN NUMBER
    // -------------------------

    const finalReturnNo =
      returnNo?.trim() ||
      returnRecord.returnNo;

    const duplicate =
      await Return.findOne({
        returnNo: finalReturnNo,
        _id: {
          $ne: returnRecord._id,
        },
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Return number already exists",
      });
    }

    // -------------------------
    // RESTORE OLD INVENTORY
    // -------------------------

    const oldInventory =
      await Inventory.findById(
        returnRecord.inventory
      );

    // Only restore the old returned quantity
    // if the old return was counted in inventory.

    if (
      oldInventory &&
      returnRecord.status !== "Rejected"
    ) {
      oldInventory.available +=
        returnRecord.quantity;

      if (
        oldInventory.available >
        oldInventory.quantity
      ) {
        oldInventory.available =
          oldInventory.quantity;
      }

      oldInventory.status =
        calculateInventoryStatus(
          oldInventory.available,
          oldInventory.minimumStock
        );

      await oldInventory.save();
    }

    // -------------------------
    // GET NEW INVENTORY
    // -------------------------

    const newInventory =
      await Inventory.findById(inventory);

    if (!newInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // -------------------------
    // APPLY NEW RETURN
    // -------------------------

    if (status !== "Rejected") {
      newInventory.available +=
        parsedQuantity;

      if (
        newInventory.available >
        newInventory.quantity
      ) {
        newInventory.available =
          newInventory.quantity;
      }

      newInventory.status =
        calculateInventoryStatus(
          newInventory.available,
          newInventory.minimumStock
        );

      await newInventory.save();
    }

    // -------------------------
    // UPDATE RECORD
    // -------------------------

    returnRecord.returnNo =
      finalReturnNo;

    returnRecord.inventory =
      inventory;

    returnRecord.department =
      department;

    returnRecord.quantity =
      parsedQuantity;

    returnRecord.returnDate =
      returnDate;

    returnRecord.returnedBy =
      returnedBy.trim();

    returnRecord.condition =
      condition;

    returnRecord.reason =
      reason.trim();

    returnRecord.stockOut =
      stockOut || null;

    returnRecord.status =
      status || "Completed";

    returnRecord.receivedBy =
      receivedBy.trim();

    returnRecord.remarks =
      remarks?.trim() || "";

    await returnRecord.save();

    // -------------------------
    // RESPONSE
    // -------------------------

    const updatedReturn =
      await Return.findById(
        returnRecord._id
      )
        .populate(
          "department",
          "name departmentName code"
        )
        .populate(
          "inventory",
          "itemCode name category unit quantity available minimumStock status"
        )
        .populate(
          "stockOut",
          "stockOutNo issuedDate issuedTo quantity"
        );

    res.status(200).json({
      success: true,
      message: "Return updated successfully",
      return: updatedReturn,
    });
  } catch (error) {
    console.error(
      "Update return error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update return",
    });
  }
};

// ======================================================
// DELETE RETURN
// ======================================================

export const deleteReturn = async (req, res) => {
  try {
    const returnRecord =
      await Return.findById(req.params.id);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: "Return record not found",
      });
    }

    // -------------------------
    // RESTORE INVENTORY
    // -------------------------

    if (returnRecord.status !== "Rejected") {
      const inventory =
        await Inventory.findById(
          returnRecord.inventory
        );

      if (inventory) {
        inventory.available -=
          returnRecord.quantity;

        if (inventory.available < 0) {
          inventory.available = 0;
        }

        if (
          inventory.available >
          inventory.quantity
        ) {
          inventory.available =
            inventory.quantity;
        }

        inventory.status =
          calculateInventoryStatus(
            inventory.available,
            inventory.minimumStock
          );

        await inventory.save();
      }
    }

    // -------------------------
    // DELETE
    // -------------------------

    await Return.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Return deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete return error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete return",
    });
  }
};

