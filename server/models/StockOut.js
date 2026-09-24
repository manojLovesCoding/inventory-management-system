import mongoose from "mongoose";

const stockOutSchema = new mongoose.Schema(
  {
    stockOutNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    issuedDate: {
      type: Date,
      required: true,
    },

    issuedTo: {
      type: String,
      required: true,
      trim: true,
    },

    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemRequest",
      default: null,
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

export default mongoose.model("StockOut", stockOutSchema);