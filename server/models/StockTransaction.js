import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "stock-in",
        "stock-out",
        "return",
        "adjustment",
      ],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    reference: {
      type: String,
      trim: true,
      default: "",
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    performedByName: {
      type: String,
      trim: true,
      default: "",
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const StockTransaction = mongoose.model(
  "StockTransaction",
  stockTransactionSchema
);

export default StockTransaction;
