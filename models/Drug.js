// models/Drug.js
import mongoose from "mongoose";

const drugSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  expiryDate: { type: Number, required: true },
  countryOfOrigin: { type: String, required: true },
  countryOfProvenance: { type: String, required: true },
  quantity: { type: Number, required: true },
  transactionId: { type: String, required: true, unique: true },
  hashScanLink: { type: String, required: true },
  currentHolder: { type: String, required: true },
  history: [{
    holder: { type: String, required: true },
    timestamp: { type: Number, required: true },
    role: { type: String, required: true }
  }],
  status: { type: String, default: "Pending" },
  pctCode: { type: String },
  cid: { type: String }, // New field for IPFS content identifier
  qrCodePath: { type: String } // Path to the stored QR code image
}, { timestamps: true });

const Drug = mongoose.model("Drug", drugSchema);

export default Drug;