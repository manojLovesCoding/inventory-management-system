import mongoose from "mongoose";
import ItemRequest from "../models/ItemRequest.js";
import Inventory from "../models/Inventory.js";
import Department from "../models/Department.js";

const generateRequestNumber = async () => {
  const year = new Date().getFullYear();

  const lastRequest = await ItemRequest.findOne({
    requestNumber: new RegExp(`^REQ-${year}-`),
  })
    .sort({ createdAt: -1 })
    .select("requestNumber");

  let nextNumber = 1;

  if (lastRequest?.requestNumber) {
    const parts = lastRequest.requestNumber.split("-");
    nextNumber = Number(parts[2]) + 1;
  }

  return `REQ-${year}-${String(nextNumber).padStart(3, "0")}`;
};

/**
 * GET /api/item-requests
 */
export const getItemRequests = async (req, res) => {
  try {
    const {
      search = "",
      status,
      priority,
      department,
    } = req.query;

    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (priority && priority !== "All") {
      filter.priority = priority;
    }

    if (department && department !== "All") {
      if (mongoose.Types.ObjectId.isValid(department)) {
        filter.department = department;
      } else {
        const departmentDoc = await Department.findOne({
          name: department,
        }).select("_id");

        if (!departmentDoc) {
          return res.json({
            success: true,
            data: [],
          });
        }

        filter.department = departmentDoc._id;
      }
    }

    let requests = await ItemRequest.find(filter)
      .populate({
        path: "item",
        select:
          "name itemName productName itemCode category unit quantity available minimumStock",
      })
      .populate({
        path: "department",
        select: "name code status",
      })
      .sort({ createdAt: -1 });

    if (search.trim()) {
      const query = search.trim().toLowerCase();

      requests = requests.filter((request) => {
        return (
          request.requestNumber
            ?.toLowerCase()
            .includes(query) ||
          request.item?.name
            ?.toLowerCase()
            .includes(query) ||
          request.item?.itemName
            ?.toLowerCase()
            .includes(query) ||
          request.department?.name
            ?.toLowerCase()
            .includes(query) ||
          request.requestedBy
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    const data = requests.map((request) => ({
      id: request.requestNumber,
      _id: request._id,

      itemId: request.item?._id,
      itemName:
        request.item?.name ||
        request.item?.itemName ||
        request.item?.productName ||
        "Unknown Item",

      itemCode: request.item?.itemCode,

      category:
        typeof request.item?.category === "object"
          ? request.item.category?.name ||
            request.item.category?.categoryName ||
            ""
          : request.item?.category || "",

      departmentId: request.department?._id,
      department: request.department?.name || "",

      requestedBy: request.requestedBy,

      quantity: request.quantity,

      unit: request.item?.unit || "Nos",

      priority: request.priority,

      status: request.status,

      requestDate: request.requestDate,

      requiredDate: request.requiredDate,

      purpose: request.purpose,

      remarks: request.remarks,

      reviewedAt: request.reviewedAt,

      issuedAt: request.issuedAt,

      rejectionReason: request.rejectionReason,
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get item requests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch item requests",
      error: error.message,
    });
  }
};

/**
 * GET /api/item-requests/:id
 */
export const getItemRequestById = async (req, res) => {
  try {
    const request = await ItemRequest.findById(req.params.id)
      .populate("item")
      .populate("department", "name code status");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get item request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch item request",
      error: error.message,
    });
  }
};

/**
 * POST /api/item-requests
 */
export const createItemRequest = async (req, res) => {
  try {
    const {
      itemId,
      department,
      requestedBy,
      quantity,
      priority,
      requiredDate,
      purpose,
      remarks,
    } = req.body;

    if (!itemId) {
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

    if (!requestedBy?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Requester name is required",
      });
    }

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    if (!requiredDate) {
      return res.status(400).json({
        success: false,
        message: "Required date is required",
      });
    }

    if (!purpose?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Purpose is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory item",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department",
      });
    }

    const item = await Inventory.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const departmentDoc = await Department.findById(department);

    if (!departmentDoc) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (
      departmentDoc.status !== undefined &&
      departmentDoc.status !== "Active"
    ) {
      return res.status(400).json({
        success: false,
        message: "Department is not active",
      });
    }

    const available =
      item.available !== undefined &&
      item.available !== null
        ? Number(item.available)
        : Number(item.quantity) || 0;

    if (Number(quantity) > available) {
      return res.status(400).json({
        success: false,
        message: `Only ${available} ${
          item.unit || "Nos"
        } available`,
      });
    }

    const requestNumber = await generateRequestNumber();

    const request = await ItemRequest.create({
      requestNumber,
      item: item._id,
      department: departmentDoc._id,
      requestedBy: requestedBy.trim(),
      quantity: Number(quantity),
      priority: priority || "Medium",
      requiredDate,
      purpose: purpose.trim(),
      remarks: remarks?.trim() || "",
      status: "Pending",
    });

    const populatedRequest =
      await ItemRequest.findById(request._id)
        .populate("item")
        .populate("department", "name code status");

    res.status(201).json({
      success: true,
      message: "Item request created successfully",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Create item request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create item request",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/item-requests/:id/approve
 */
export const approveItemRequest = async (req, res) => {
  try {
    const request = await ItemRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a ${request.status.toLowerCase()} request`,
      });
    }

    const item = await Inventory.findById(request.item);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item no longer exists",
      });
    }

    const available =
      item.available !== undefined &&
      item.available !== null
        ? Number(item.available)
        : Number(item.quantity) || 0;

    if (request.quantity > available) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${available} ${
          item.unit || "Nos"
        } available`,
      });
    }

    request.status = "Approved";
    request.reviewedAt = new Date();

    await request.save();

    res.json({
      success: true,
      message: "Request approved successfully",
      data: request,
    });
  } catch (error) {
    console.error("Approve request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to approve request",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/item-requests/:id/reject
 */
export const rejectItemRequest = async (req, res) => {
  try {
    const request = await ItemRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a ${request.status.toLowerCase()} request`,
      });
    }

    request.status = "Rejected";
    request.reviewedAt = new Date();
    request.rejectionReason =
      req.body?.reason?.trim() || "";

    await request.save();

    res.json({
      success: true,
      message: "Request rejected successfully",
      data: request,
    });
  } catch (error) {
    console.error("Reject request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reject request",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/item-requests/:id/issue
 */
export const issueItemRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const request = await ItemRequest.findById(
      req.params.id,
    ).session(session);

    if (!request) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    if (request.status !== "Approved") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Only approved requests can be issued",
      });
    }

    const item = await Inventory.findById(
      request.item,
    ).session(session);

    if (!item) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const available =
      item.available !== undefined &&
      item.available !== null
        ? Number(item.available)
        : Number(item.quantity) || 0;

    if (request.quantity > available) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${available} ${
          item.unit || "Nos"
        } available`,
      });
    }

    /*
     * IMPORTANT
     *
     * Your inventory model appears to use:
     *
     * quantity
     * available
     *
     * We decrease available when the item is issued.
     *
     * If your stock-in logic uses another field,
     * adjust this section accordingly.
     */

    if (
      item.available !== undefined &&
      item.available !== null
    ) {
      item.available =
        Number(item.available) - request.quantity;
    } else {
      item.quantity =
        Number(item.quantity || 0) -
        request.quantity;
    }

    /*
     * Update inventory status if your model has status.
     */
    if ("status" in item) {
      const currentAvailable =
        item.available !== undefined
          ? Number(item.available)
          : Number(item.quantity || 0);

      if (currentAvailable <= 0) {
        item.status = "Out of Stock";
      } else if (
        Number(item.minimumStock || 0) > 0 &&
        currentAvailable <= Number(item.minimumStock)
      ) {
        item.status = "Low Stock";
      } else {
        item.status = "Available";
      }
    }

    await item.save({ session });

    request.status = "Issued";
    request.issuedAt = new Date();

    await request.save({ session });

    await session.commitTransaction();

    const updatedRequest =
      await ItemRequest.findById(request._id)
        .populate("item")
        .populate("department", "name code");

    res.json({
      success: true,
      message: "Item issued successfully",
      data: updatedRequest,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Issue request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to issue item",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * GET /api/item-requests/stats
 */
export const getItemRequestStats = async (
  req,
  res,
) => {
  try {
    const stats = await ItemRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      issued: 0,
    };

    stats.forEach((stat) => {
      const key = stat._id?.toLowerCase();

      if (key && key in result) {
        result[key] = stat.count;
      }

      result.total += stat.count;
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Request stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch request statistics",
      error: error.message,
    });
  }
};