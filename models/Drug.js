import mongoose from "mongoose";

const drugSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  expiryDate: { type: Number, required: true },
  countryOfOrigin: { type: String, required: true },
  countryOfProvenance: { type: String, required: true },
  transactionId: { type: String, required: true },
  hashScanLink: { type: String, required: true },
  quantity: { type: Number, required: true },
  pctCode: { type: String, default: null },
  currentHolder: { type: String, required: true },
  history: [
    {
      holder: { type: String, required: true },
      timestamp: { type: Number, required: true },
      role: { type: String, required: true }
    }
  ]
});

const Drug = mongoose.model("Drug", drugSchema);

export default Drug;