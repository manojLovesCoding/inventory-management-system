import express from "express";

import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const departmentRouter = express.Router();

// All department routes require authentication + admin role
departmentRouter.use(protect);
departmentRouter.use(authorize("admin","department"));

departmentRouter.get("/", getDepartments);

departmentRouter.get("/:id", getDepartmentById);

departmentRouter.post("/", createDepartment);

departmentRouter.put("/:id", updateDepartment);

departmentRouter.delete("/:id", deleteDepartment);

export default departmentRouter;
