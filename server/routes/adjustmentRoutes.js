
import express from "express";

import {
  getAdjustments,
  getAdjustmentById,
  createAdjustment,
  approveAdjustment,
  rejectAdjustment,
} from "../controllers/adjustmentController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const adjustmentRouter = express.Router();

// All adjustment routes are admin-only
adjustmentRouter.use(protect);
adjustmentRouter.use(authorize("admin"));

// Get all adjustments
adjustmentRouter.get("/", getAdjustments);

// Get adjustment by ID
adjustmentRouter.get("/:id", getAdjustmentById);

// Create adjustment
adjustmentRouter.post("/", createAdjustment);

// Approve adjustment
adjustmentRouter.patch("/:id/approve", approveAdjustment);

// Reject adjustment
adjustmentRouter.patch("/:id/reject", rejectAdjustment);

export default adjustmentRouter;
