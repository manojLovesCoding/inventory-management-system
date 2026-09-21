import express from "express";

import {
  getItemRequests,
  getItemRequestById,
  createItemRequest,
  approveItemRequest,
  rejectItemRequest,
  issueItemRequest,
  getItemRequestStats,
} from "../controllers/itemRequestController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const requestRouter = express.Router();

// All inventory routes require admin
requestRouter.use(protect);
requestRouter.use(authorize("admin","department"));

/*
 * GET /api/item-requests
 */
requestRouter.get("/", getItemRequests);

/*
 * GET /api/item-requests/stats
 */
requestRouter.get("/stats", getItemRequestStats);

/*
 * GET /api/item-requests/:id
 */
requestRouter.get("/:id", getItemRequestById);

/*
 * POST /api/item-requests
 */
requestRouter.post("/", createItemRequest);

/*
 * PATCH /api/item-requests/:id/approve
 */
requestRouter.patch("/:id/approve", approveItemRequest);

/*
 * PATCH /api/item-requests/:id/reject
 */
requestRouter.patch("/:id/reject", rejectItemRequest);

/*
 * PATCH /api/item-requests/:id/issue
 */
requestRouter.patch("/:id/issue", issueItemRequest);

export default requestRouter;
