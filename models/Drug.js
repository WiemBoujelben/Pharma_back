import mongoose from "mongoose";

const drugSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  expiryDate: { type: Number, required: true },
  countryOfOrigin: { type: String, required: true },
  countryOfProvenance: { type: String, required: true },
  transactionId: { type: String, required: true }, // Store the transaction ID
  hashScanLink: { type: String, required: true }, // Store the HashScan link
});

const Drug = mongoose.model("Drug", drugSchema);

export default Drug;