import express from "express";

import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus,
} from "../controllers/supplierController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const supplierRouter = express.Router();

// All supplier routes require authentication + admin role
supplierRouter.use(protect);
supplierRouter.use(authorize("admin"));

supplierRouter.get("/", getSuppliers);

supplierRouter.get("/:id", getSupplierById);

supplierRouter.post("/", createSupplier);

supplierRouter.put("/:id", updateSupplier);

supplierRouter.patch("/:id/status", toggleSupplierStatus);

supplierRouter.delete("/:id", deleteSupplier);

export default supplierRouter;

