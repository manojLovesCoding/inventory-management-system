import express from "express";

import {
  getInventory,
  getInventoryById,
  getPurchasedItems,
  createInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const inventoryRouter = express.Router();

// All inventory routes require admin
inventoryRouter.use(protect);
inventoryRouter.use(authorize("admin","department"));

// Purchased items available for inventory
inventoryRouter.get("/purchased-items", getPurchasedItems);

// Inventory list
inventoryRouter.get("/", getInventory);

// Single inventory item
inventoryRouter.get("/:id", getInventoryById);

// Create inventory from purchase
inventoryRouter.post("/", createInventory);

// Update inventory
inventoryRouter.put("/:id", updateInventory);

// Delete inventory
inventoryRouter.delete("/:id", deleteInventory);

export default inventoryRouter;
