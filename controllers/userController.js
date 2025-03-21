import User from "../models/User.js";

const registerUser = async (req, res) => {
    const { wallet, role, transactionId, hashScanLink } = req.body;
  
    console.log("Received registration request:", { wallet, role, transactionId, hashScanLink }); // Debug log
  
    try {
      // Validate input
      if (!wallet || !role || !transactionId || !hashScanLink) {
        throw new Error("Missing required fields");
      }
  
      // Check if the user already exists
      const existingUser = await User.findOne({ wallet });
      if (existingUser) {
        throw new Error("User already registered");
      }
  
      // Save the user to MongoDB
      const user = new User({
        wallet,
        role,
        registrationTransactionId: transactionId,
        registrationHashScanLink: hashScanLink,
      });
  
      await user.save();
  
      console.log("User saved successfully:", user); // Debug log
  
      res.status(201).json({
        message: "User registered successfully",
        user,
        transactionId,
        hashScanLink,
      });
    } catch (err) {
      console.error("Error in registerUser:", err); // Debug log
      res.status(500).json({ message: err.message || "An error occurred during registration" });
    }
  };

export default { registerUser };