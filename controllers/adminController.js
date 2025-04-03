import User from "../models/User.js";
import Drug from "../models/Drug.js";
import hederaService from "../services/hederaService.js";

// Use named exports
export const approveUserRequest = async (req, res) => {
    const { wallet } = req.body;
    console.log("Received request body:", req.body); // Debug log
  
    try {
      console.log("Approving user with wallet:", wallet);
  
      if (!wallet) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
  
      // Check if the user exists in MongoDB
      const user = await User.findOne({ wallet });
      if (!user) {
        console.log("User not found in MongoDB:", wallet);
        return res.status(404).json({ message: "User not found in MongoDB" });
      }
  
      // Approve the user in the Hedera smart contract
      const approvalResult = await hederaService.approveUser(wallet);
      console.log("Approval result from Hedera:", approvalResult);
  
      // Update the user in MongoDB
      user.isApproved = true;
      user.approvalTransactionId = approvalResult.transactionId;
      user.approvalHashScanLink = approvalResult.hashScanLink;
      await user.save();
  
      console.log("User approved successfully:", user); // Debug log
  
      res.status(200).json({
        message: "User approved successfully",
        hashScanLink: approvalResult.hashScanLink,
        user,
      });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

export const getPendingRequests = async (req, res) => {
  try {
    // Fetch users with isApproved: false
    const pendingRequests = await User.find({ isApproved: false });
    res.status(200).json(pendingRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getApprovedUsers = async (req, res) => {
    try {
      const approvedUsers = await User.find({ isApproved: true });
      res.status(200).json(approvedUsers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


// Get pending drugs (add this to your drugController.js)
export const getPendingDrugs = async (req, res) => {
  console.log("getPendingDrugs controller function called");
  try {
    const drugs = await Drug.find({ status: "Pending" });
    console.log(`Found ${drugs.length} pending drugs`);
    return res.status(200).json(drugs); // Explicit return
  } catch (err) {
    console.error("Error in getPendingDrugs:", err);
    return res.status(500).json({ 
      message: err.message,
      error: err.stack 
    });
  }
};

export const getInventory = async (req, res) => {
  console.log("getInventory controller function called");
  try {
    const drugs = await Drug.find({ status: "Approved" });
    console.log(`Found ${drugs.length} inventory drugs`);
    return res.status(200).json(drugs); // Explicit return
  } catch (err) {
    console.error("Error in getInventory:", err);
    return res.status(500).json({ 
      message: err.message,
      error: err.stack 
    });
  }
};


export const approveUser = async (req, res) => {
  const { wallet, hashScanLink } = req.body;
  
  try {
    const user = await User.findOne({ wallet });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update all approval-related fields
    user.isApproved = true;
    user.approvalTransactionId = hashScanLink.split('/').pop(); // Extract transaction ID from link
    user.approvalHashScanLink = hashScanLink;
    await user.save();

    res.status(200).json({ 
      message: "User approved successfully",
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectUser = async (req, res) => {
  const { wallet } = req.body;
  
  try {
    const user = await User.findOne({ wallet });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove user from database
    await User.deleteOne({ wallet });

    res.status(200).json({ 
      message: "User rejected successfully",
      hashScanLink: req.body.hashScanLink || ""
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};