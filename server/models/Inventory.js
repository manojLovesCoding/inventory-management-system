import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    available: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Available", "Low Stock", "Out of Stock"],
      default: "Available",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Optional references for inventory items
    // created from a purchase.
    //
    // IMPORTANT:
    // No default: null here.
    // Manual inventory items will not contain these fields.
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
    },

    purchaseItemCode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// ======================================================
// PURCHASE INVENTORY UNIQUENESS
// ======================================================
//
// Prevents the same purchase item from being added
// to inventory more than once.
//
// Because this is sparse, manually-created inventory
// items without purchase fields are not included.
//
// ======================================================

inventorySchema.index(
  {
    purchase: 1,
    purchaseItemCode: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;