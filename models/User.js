import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  fullName: { type: String, required: true }, // New field
  email: { type: String, required: true, unique: true }, // New field
  phone: { type: String, required: true }, // New field
  location: { type: String, required: true }, // New field
  isApproved: { type: Boolean, default: false },
  registrationTransactionId: { type: String }, // Transaction ID for registration
  registrationHashScanLink: { type: String }, // HashScan link for registration
  approvalTransactionId: { type: String }, // Transaction ID for approval
  approvalHashScanLink: { type: String }, // HashScan link for approval
});

const User = mongoose.model("User", userSchema);

export default User;