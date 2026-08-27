import express from "express";
import cors from "cors";
import "dotenv/config";
import dns from "dns";

import connectDB from "./config/db.js";
import authrouter from "./routes/authRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

const app = express();

const PORT = process.env.PORT || 4000;

// Fix MongoDB Atlas SRV DNS resolution
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("Inventory Management API is running");
});

app.use("/api/auth", authrouter);
app.use("/api/dashboard", dashboardRouter);

// Database
await connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
