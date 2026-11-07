
import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
      trim: true,
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

    unit: {
      type: String,
      required: true,
      trim: true,
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

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lineTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    purchaseDate: {
      type: Date,
      required: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    department: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Department",
  required: true,
},

    invoiceNo: {
      type: String,
      trim: true,
      default: "",
    },

    invoiceDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Ordered",
        "Received",
        "Partially Received",
        "Cancelled",
      ],
      default: "Draft",
    },

    orderedBy: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    items: {
      type: [purchaseItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "At least one purchase item is required",
      },
    },

    totalQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;