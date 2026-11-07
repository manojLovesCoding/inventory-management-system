
import mongoose from "mongoose";

const adjustmentSchema = new mongoose.Schema(
  {
    adjustmentNo: {
      type: String,
      required: true,
      unique: true,
    },

    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    item: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "",
    },

    adjustmentType: {
      type: String,
      enum: [
        "Stock Correction",
        "Damage",
        "Loss",
        "Found Stock",
      ],
      required: true,
    },

    previousQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    adjustedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    difference: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    adjustmentDate: {
      type: Date,
      required: true,
    },

    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    reference: {
      type: String,
      trim: true,
      default: "",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Adjustment = mongoose.model(
  "Adjustment",
  adjustmentSchema
);

export default Adjustment;
