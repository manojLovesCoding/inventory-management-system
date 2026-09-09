import express from "express";

import {
  getStockIns,
  getStockInById,
  createStockIn,
  updateStockIn,
  updateStockInStatus,
  deleteStockIn,
} from "../controllers/stockInController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const stockInRouter = express.Router();

// All stock-in routes require authentication + admin role
stockInRouter.use(protect);
stockInRouter.use(authorize("admin"));

stockInRouter.get("/", getStockIns);

stockInRouter.get("/:id", getStockInById);

stockInRouter.post("/", createStockIn);

stockInRouter.put("/:id", updateStockIn);

stockInRouter.patch(
  "/:id/status",
  updateStockInStatus
);

stockInRouter.delete(
  "/:id",
  deleteStockIn
);

export default stockInRouter;