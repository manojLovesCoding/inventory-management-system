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

// All return routes require authentication + admin role

returnRouter.use(protect);

returnRouter.use(authorize("admin"));

returnRouter.get("/", getReturns);

returnRouter.get("/:id", getReturnById);

returnRouter.post("/", createReturn);

returnRouter.put("/:id", updateReturn);

returnRouter.delete("/:id", deleteReturn);

export default returnRouter;
