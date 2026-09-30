import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
  {
    returnNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    returnDate: {
      type: Date,
      required: true,
    },

    returnedBy: {
      type: String,
      required: true,
      trim: true,
    },

    condition: {
      type: String,
      enum: ["Good", "Repair", "Damaged"],
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    stockOut: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockOut",
      default: null,
    },

    status: {
      type: String,
      enum: ["Completed", "Under Inspection", "Rejected"],
      default: "Completed",
    },

    receivedBy: {
      type: String,
      required: true,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Return", returnSchema);
