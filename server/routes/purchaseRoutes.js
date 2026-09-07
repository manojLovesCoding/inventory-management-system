import express from "express";

import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  updatePurchaseStatus,
  deletePurchase,
} from "../controllers/purchaseController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const purchaseRouter = express.Router();

// All purchase routes require authentication + admin role
purchaseRouter.use(protect);
purchaseRouter.use(authorize("admin"));

purchaseRouter.get("/", getPurchases);

purchaseRouter.get("/:id", getPurchaseById);

purchaseRouter.post("/", createPurchase);

purchaseRouter.put("/:id", updatePurchase);

purchaseRouter.patch(
  "/:id/status",
  updatePurchaseStatus
);

purchaseRouter.delete(
  "/:id",
  deletePurchase
);

export default purchaseRouter;
