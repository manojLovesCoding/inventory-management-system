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

    // Optional references for items created from purchases
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },

    purchaseItemCode: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// SPARSE index: Only enforces uniqueness when purchase & purchaseItemCode are present
inventorySchema.index(
  { purchase: 1, purchaseItemCode: 1 },
  { unique: true, sparse: true }
);

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;