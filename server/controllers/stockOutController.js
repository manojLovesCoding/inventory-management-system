import StockOut from "../models/StockOut.js";
import Inventory from "../models/Inventory.js";
import Department from "../models/Department.js";
import ItemRequest from "../models/ItemRequest.js";

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

const calculateInventoryStatus = (available, minimumStock = 0) => {
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

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      query.$or = [
        { stockOutNo: regex },
        { issuedTo: regex },
        { notes: regex },
      ];
    }

    if (department !== "All") {
      query.department = department;
    }

    if (inventory !== "All") {
      query.inventory = inventory;
    }

    const stockOuts = await StockOut.find(query)
      .populate(
        "department",
        "name departmentName code"
      )
      .populate(
        "inventory",
        "itemCode name category unit quantity available minimumStock status"
      )
      .populate(
        "request",
        "requestNo status"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stockOuts.length,
      stockOuts,
    });
  } catch (error) {
    console.error("Get stock out error:", error);

    res.status(500).json({
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
    const stockOut = await StockOut.findById(req.params.id)
      .populate(
        "department",
        "name departmentName code"
      )
      .populate(
        "inventory",
        "itemCode name category unit quantity available minimumStock status"
      )
      .populate(
        "request",
        "requestNo status"
      );

    if (!stockOut) {
      return res.status(404).json({
        success: false,
        message: "Stock Out record not found",
      });
    }

    res.status(200).json({
      success: true,
      stockOut,
    });
  } catch (error) {
    console.error("Get stock out error:", error);

    res.status(500).json({
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

    // -------------------------
    // VALIDATION
    // -------------------------

    if (!department) {
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
      const requestExists =
        await ItemRequest.findById(request);

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

    let finalStockOutNo =
      stockOutNo?.trim();

    if (!finalStockOutNo) {
      finalStockOutNo =
        await generateStockOutNo();
    }

    const duplicate =
      await StockOut.findOne({
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
      department,
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
    // POPULATE RESPONSE
    // -------------------------

    const populatedStockOut =
      await StockOut.findById(stockOut._id)
        .populate(
          "department",
          "name departmentName code"
        )
        .populate(
          "inventory",
          "itemCode name category unit quantity available minimumStock status"
        )
        .populate(
          "request",
          "requestNo status"
        );

    res.status(201).json({
      success: true,
      message: "Stock Out created successfully",
      stockOut: populatedStockOut,
    });
  } catch (error) {
    console.error("Create stock out error:", error);

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create Stock Out",
    });
  }
};

// ======================================================
// UPDATE STOCK OUT
// ======================================================

export const updateStockOut = async (req, res) => {
  try {
    const stockOut =
      await StockOut.findById(req.params.id);

    if (!stockOut) {
      return res.status(404).json({
        success: false,
        message: "Stock Out record not found",
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

    if (!department) {
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

    const departmentExists =
      await Department.findById(department);

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
      const requestExists =
        await ItemRequest.findById(request);

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
      stockOutNo?.trim() ||
      stockOut.stockOutNo;

    const duplicate =
      await StockOut.findOne({
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
    // RESTORE OLD INVENTORY
    // -------------------------

    const oldInventory =
      await Inventory.findById(stockOut.inventory);

    if (oldInventory) {
      oldInventory.available += stockOut.quantity;

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

    // If changing inventory, stock from old item
    // has already been restored.

    if (
      oldInventory &&
      oldInventory._id.toString() ===
        newInventory._id.toString()
    ) {
      // Same inventory item has already had
      // the old quantity restored.
    }

    if (
      parsedQuantity >
      newInventory.available
    ) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available quantity is ${newInventory.available}`,
      });
    }

    // -------------------------
    // APPLY NEW STOCK OUT
    // -------------------------

    newInventory.available -=
      parsedQuantity;

    newInventory.status =
      calculateInventoryStatus(
        newInventory.available,
        newInventory.minimumStock
      );

    await newInventory.save();

    // -------------------------
    // UPDATE RECORD
    // -------------------------

    stockOut.stockOutNo =
      finalStockOutNo;

    stockOut.department =
      department;

    stockOut.inventory =
      inventory;

    stockOut.quantity =
      parsedQuantity;

    stockOut.issuedDate =
      issuedDate;

    stockOut.issuedTo =
      issuedTo.trim();

    stockOut.request =
      request || null;

    stockOut.notes =
      notes?.trim() || "";

    await stockOut.save();

    // -------------------------
    // RESPONSE
    // -------------------------

    const updatedStockOut =
      await StockOut.findById(
        stockOut._id
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
          "request",
          "requestNo status"
        );

    res.status(200).json({
      success: true,
      message: "Stock Out updated successfully",
      stockOut: updatedStockOut,
    });
  } catch (error) {
    console.error(
      "Update stock out error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update Stock Out",
    });
  }
};

// ======================================================
// DELETE STOCK OUT
// ======================================================

export const deleteStockOut = async (req, res) => {
  try {
    const stockOut =
      await StockOut.findById(req.params.id);

    if (!stockOut) {
      return res.status(404).json({
        success: false,
        message: "Stock Out record not found",
      });
    }

    // -------------------------
    // RESTORE INVENTORY
    // -------------------------

    const inventory =
      await Inventory.findById(
        stockOut.inventory
      );

    if (inventory) {
      inventory.available +=
        stockOut.quantity;

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

    // -------------------------
    // DELETE
    // -------------------------

    await StockOut.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Stock Out deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete stock out error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete Stock Out",
    });
  }
};
