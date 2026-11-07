
import Adjustment from "../models/Adjustment.js";
import Inventory from "../models/Inventory.js";
import Department from "../models/Department.js";

// Check whether the logged-in user is admin
const isAdmin = (req) =>
  req.user?.role?.toLowerCase() === "admin";

// Generate adjustment number
const generateAdjustmentNo = async () => {
  const count = await Adjustment.countDocuments();

  return `ADJ-${String(count + 1).padStart(3, "0")}`;
};

// Get all adjustments
export const getAdjustments = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can access stock adjustments",
      });
    }

    const adjustments = await Adjustment.find()
      .populate("inventory", "itemCode name")
      .populate("department", "name")
      .populate("adjustedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: adjustments.length,
      adjustments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get adjustment by ID
export const getAdjustmentById = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can access stock adjustments",
      });
    }

    const adjustment = await Adjustment.findById(req.params.id)
      .populate("inventory", "itemCode name")
      .populate("department", "name")
      .populate("adjustedBy", "name email");

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Adjustment not found",
      });
    }

    return res.status(200).json({
      success: true,
      adjustment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create adjustment
export const createAdjustment = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can create stock adjustments",
      });
    }

    const {
      inventory: inventoryId,
      adjustmentType,
      physicalQuantity,
      department: departmentId,
      adjustmentDate,
      reason,
      reference,
      remarks,
    } = req.body;

    // Validate required fields
    if (
      !inventoryId ||
      !adjustmentType ||
      physicalQuantity === undefined ||
      !departmentId ||
      !adjustmentDate ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const quantity = Number(physicalQuantity);

    if (!Number.isFinite(quantity) || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Physical quantity must be a valid number greater than or equal to zero",
      });
    }

    const allowedTypes = [
      "Stock Correction",
      "Damage",
      "Loss",
      "Found Stock",
    ];

    if (!allowedTypes.includes(adjustmentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid adjustment type",
      });
    }

    const parsedDate = new Date(adjustmentDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid adjustment date",
      });
    }

    // Find inventory item
    const inventory = await Inventory.findById(inventoryId);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // Find department
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Current available stock
    const previousQuantity = Number(inventory.available);

    if (!Number.isFinite(previousQuantity)) {
      return res.status(400).json({
        success: false,
        message: "Inventory available quantity is invalid",
      });
    }

    // Calculate stock difference
    const difference = quantity - previousQuantity;

    // Generate adjustment number
    const adjustmentNo = await generateAdjustmentNo();

    const adjustment = await Adjustment.create({
      adjustmentNo,
      inventory: inventory._id,
      item: inventory.name,
      category: inventory.category || "",
      adjustmentType,
      previousQuantity,
      adjustedQuantity: quantity,
      difference,
      reason,
      department: department._id,
      adjustmentDate: parsedDate,
      adjustedBy: req.user._id,
      status: "Pending",
      reference: reference || "",
      remarks: remarks || "",
    });

    return res.status(201).json({
      success: true,
      message: "Stock adjustment created successfully. Waiting for approval.",
      adjustment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve adjustment
export const approveAdjustment = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can approve stock adjustments",
      });
    }

    const adjustment = await Adjustment.findById(req.params.id);

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Adjustment not found",
      });
    }

    if (adjustment.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending adjustments can be approved",
      });
    }

    const inventory = await Inventory.findById(
      adjustment.inventory
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Related inventory item not found",
      });
    }

    // Make sure stock has not changed since the adjustment was created
    if (
      Number(inventory.available) !==
      adjustment.previousQuantity
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Inventory quantity has changed since this adjustment was created. Create a new adjustment using the latest stock quantity.",
      });
    }

    // Update available stock only
    inventory.available = adjustment.adjustedQuantity;

    if (inventory.available <= 0) {
      inventory.status = "Out of Stock";
    } else if (
      inventory.available <= (inventory.minimumStock || 0)
    ) {
      inventory.status = "Low Stock";
    } else {
      inventory.status = "Available";
    }

    await inventory.save();

    adjustment.status = "Approved";
    await adjustment.save();

    return res.status(200).json({
      success: true,
      message: "Adjustment approved and inventory quantity updated successfully",
      adjustment,
      availableQuantity: inventory.available,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject adjustment
export const rejectAdjustment = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can reject stock adjustments",
      });
    }

    const adjustment = await Adjustment.findById(req.params.id);

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Adjustment not found",
      });
    }

    if (adjustment.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending adjustments can be rejected",
      });
    }

    adjustment.status = "Rejected";

    await adjustment.save();

    return res.status(200).json({
      success: true,
      message: "Stock adjustment rejected successfully",
      adjustment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
