// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  drugId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drug', required: true },
  distributor: { type: String, required: true },
  distributorName: { type: String }, // Added distributor name for display
  status: { type: String, default: "Requested" }, // Requested, Approved, Rejected
  transactionId: { type: String, required: true },
  hashScanLink: { type: String, required: true },
  timestamp: { type: Number, default: Date.now },
  approvalTransactionId: { type: String }, // For approved/rejected transactions
  approvalHashScanLink: { type: String },  // For approved/rejected transactions
  approvedBy: { type: String },            // Admin who approved/rejected
  rejectionReason: { type: String }        // Optional reason for rejection
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;