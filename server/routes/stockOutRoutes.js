import express from "express";

import {
  getStockOuts,
  getStockOutById,
  createStockOut,
  updateStockOut,
  deleteStockOut,
} from "../controllers/stockOutController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const stockOutRouter = express.Router();

// All Stock Out routes require authentication
stockOutRouter.use(protect);

// Admin and department users can access Stock Out routes
stockOutRouter.use(authorize("admin", "department"));

stockOutRouter.get("/", getStockOuts);

stockOutRouter.get("/:id", getStockOutById);

stockOutRouter.post("/", createStockOut);

stockOutRouter.put("/:id", updateStockOut);

// Only admin can delete Stock Out records
stockOutRouter.delete("/:id", authorize("admin"), deleteStockOut);

export default stockOutRouter;