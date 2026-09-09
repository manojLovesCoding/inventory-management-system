import mongoose from "mongoose";

const stockInItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
      trim: true,
    },

    item: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
      default: "units",
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalValue: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const stockInSchema = new mongoose.Schema(
  {
    stockInNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    referenceNo: {
      type: String,
      required: true,
      trim: true,
    },

    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    receivedDate: {
      type: Date,
      required: true,
    },

    receivedBy: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Received", "Cancelled"],
      default: "Pending",
    },

    item: {
      type: stockInItemSchema,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("StockIn", stockInSchema);
