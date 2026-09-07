import express from "express";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const categoryRouter = express.Router();

// All category routes require authentication + admin role
categoryRouter.use(protect);
categoryRouter.use(authorize("admin"));

categoryRouter.get("/", getCategories);

categoryRouter.get("/:id", getCategoryById);

categoryRouter.post("/", createCategory);

categoryRouter.put("/:id", updateCategory);

categoryRouter.delete("/:id", deleteCategory);

export default categoryRouter;