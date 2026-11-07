import express from "express";
import cors from "cors";
import "dotenv/config";
import dns from "dns";

import connectDB from "./config/db.js";
import authrouter from "./routes/authRoutes.js";
//import dashboardRouter from "./routes/dashboardRoutes.js";
import supplierRouter from "./routes/supplierRoutes.js";
import purchaseRouter from "./routes/purchaseRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import departmentRouter from "./routes/departmentRoutes.js";
import inventoryRouter from "./routes/inventoryRoutes.js";
import userRouter from "./routes/userRoutes.js";
import stockInRouter from "./routes/stockInRoutes.js";
import requestRouter from "./routes/itemRequestRoutes.js";
import stockOutRouter from "./routes/stockOutRoutes.js";
import returnRouter from "./routes/returnRoutes.js";
import adjustmentRouter from "./routes/adjustmentRoutes.js";


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
//app.use("/api/dashboard", dashboardRouter);
app.use("/api/suppliers", supplierRouter);
app.use("/api/purchases", purchaseRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/users", userRouter);
app.use("/api/stock-in", stockInRouter);
app.use("/api/requests", requestRouter);
app.use("/api/stock-out", stockOutRouter);
app.use("/api/returns", returnRouter);
app.use("/api/adjustments", adjustmentRouter);


// Database
await connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
