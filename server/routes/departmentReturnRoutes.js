import express from "express";

import {
  getMyDepartmentReturns,
  getReturnableItems,
  createDepartmentReturn,
  cancelDepartmentReturn,
  acceptDepartmentReturn,
  rejectDepartmentReturn,
} from "../controllers/departmentReturnController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const departmentReturnRouter = express.Router();

departmentReturnRouter.use(protect);

// ---------- Department users ----------

// Must be declared before "/:id" routes
departmentReturnRouter.get(
  "/issued-items",
  authorize("department"),
  getReturnableItems,
);

departmentReturnRouter.get(
  "/",
  authorize("department"),
  getMyDepartmentReturns,
);

departmentReturnRouter.post(
  "/",
  authorize("department"),
  createDepartmentReturn,
);

departmentReturnRouter.delete(
  "/:id",
  authorize("department"),
  cancelDepartmentReturn,
);

// ---------- Admin ----------

departmentReturnRouter.patch(
  "/:id/accept",
  authorize("admin"),
  acceptDepartmentReturn,
);

departmentReturnRouter.patch(
  "/:id/reject",
  authorize("admin"),
  rejectDepartmentReturn,
);

export default departmentReturnRouter;