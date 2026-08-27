import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import protect from "../middleware/authMiddleware.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/", protect, getDashboard);

export default dashboardRouter;
