import express from "express";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from "../controllers/userController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const userRouter = express.Router();

/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

// Authenticated users can access their own profile
userRouter.get("/me", protect, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

/*
|--------------------------------------------------------------------------
| ADMIN USER MANAGEMENT
|--------------------------------------------------------------------------
*/

// All user management routes require authentication + admin role
userRouter.use(protect);
userRouter.use(authorize("admin"));

userRouter.get("/", getUsers);

userRouter.get("/:id", getUserById);

userRouter.post("/", createUser);

userRouter.put("/:id", updateUser);

userRouter.patch("/:id/status", toggleUserStatus);

userRouter.delete("/:id", deleteUser);

export default userRouter;
