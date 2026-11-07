import express from "express";

import {
  getReturns,
  getReturnById,
  createReturn,
  updateReturn,
  deleteReturn,
} from "../controllers/returnController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const returnRouter = express.Router();

returnRouter.use(protect);

// Admin and department users
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

returnRouter.post(
  "/",
  authorize("admin", "department"),
  createReturn,
);

returnRouter.put(
  "/:id",
  authorize("admin", "department"),
  updateReturn,
);

// Only admin can delete
returnRouter.delete(
  "/:id",
  authorize("admin"),
  deleteReturn,
);

export default returnRouter;