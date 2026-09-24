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

// All stock-out routes require authentication + admin role
stockOutRouter.use(protect);
stockOutRouter.use(authorize("admin"));

stockOutRouter.get("/", getStockOuts);

stockOutRouter.get("/:id", getStockOutById);

stockOutRouter.post("/", createStockOut);

stockOutRouter.put("/:id", updateStockOut);

stockOutRouter.delete("/:id", deleteStockOut);

export default stockOutRouter;
