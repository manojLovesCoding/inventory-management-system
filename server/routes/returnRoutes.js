
import express from "express";

import {
  getReturns,
  getReturnById,
  createReturn,
  updateReturn,
  updateReturnStatus,
  deleteReturn,
} from "../controllers/returnController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const returnRouter = express.Router();

returnRouter.use(protect);

// Admin and department users can view requests
returnRouter.get(
  "/",
  authorize("admin", "department"),
  getReturns,
);

returnRouter.get(
  "/:id",
  authorize("admin", "department"),
  getReturnById,
);

// Admin and department users can submit requests
returnRouter.post(
  "/",
  authorize("admin", "department"),
  createReturn,
);

// Only admin can update request details
returnRouter.put(
  "/:id",
  authorize("admin"),
  updateReturn,
);

// Only admin can approve, inspect, complete, or reject
returnRouter.patch(
  "/:id/status",
  authorize("admin"),
  updateReturnStatus,
);

// Only admin can delete requests
returnRouter.delete(
  "/:id",
  authorize("admin"),
  deleteReturn,
);

export default returnRouter;
