import User from "../models/User.js";
import hederaService from "../services/hederaService.js";


const registerUser = async (req, res) => {
  const { wallet, role } = req.body;
  console.log("Registering user:", wallet, role); // Debug log
  try {
      const { status, transactionId, hashScanLink } = await hederaService.registerUser(wallet, role);
      console.log("Smart contract registration result:", { status, transactionId, hashScanLink }); // Debug log

      const user = new User({ wallet, role, registrationTransactionId: transactionId, registrationHashScanLink: hashScanLink });
      await user.save();
      console.log("User saved to MongoDB:", user); // Debug log

      res.status(201).json({
          message: "User registered successfully",
          user,
          transactionId,
          hashScanLink,
      });
  } catch (err) {
      console.error("Registration error:", err); // Debug log
      res.status(500).json({ message: err.message || "An error occurred during registration" });
  }
};

export default { registerUser };