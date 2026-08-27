import express from "express";
import protect from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/me", protect, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default userRouter;