import User from "../models/User.js";
import dotenv from "dotenv";
import hederaService from "../services/hederaService.js";

dotenv.config();

const login = async (req, res) => {
  const { wallet } = req.body;
  const walletLower=wallet.toLowerCase();
  console.log("Login request received for wallet:", wallet);
  try {
    // Check if the wallet address matches the admin's wallet address
    if (wallet === process.env.ADMIN_WALLET) {
      console.log("Admin wallet matched:", wallet);
      req.session.wallet = wallet;
      req.session.role = "admin";
      req.session.isApproved = true;
      console.log("Admin session set:", req.session);
      return res.status(200).json({ 
        message: "Admin login successful", 
        isAdmin: true,
        role: "admin"
      });
    }

    // For non-admin users, check the database
    const user = await User.findOne({ wallet: walletLower });
    if (!user) {
      console.log("User not found for wallet:", walletLower);
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    req.session.wallet = walletLower;
    req.session.role = user.role;
    req.session.isApproved = user.isApproved;
    console.log("User session set:", req.session);

    res.status(200).json({ 
      message: "Login successful", 
      isAdmin: false,
      role: user.role  // Include the role in the response
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

const register = async (req, res) => {
  const { wallet, role } = req.body;
  try {
    const existingUser = await User.findOne({ wallet });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Register the user in the smart contract
    const { status, transactionId, hashScanLink } = await hederaService.registerUser(wallet, role);

    // Save the user to MongoDB with transaction details
    const user = new User({
      wallet,
      role,
      registrationTransactionId: transactionId,
      registrationHashScanLink: hashScanLink,
    });
    await user.save();

    res.status(201).json({
      message: "Registration request submitted. Waiting for admin approval.",
      user,
      transactionId,
      hashScanLink,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false });
    res.status(200).json(pendingUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveUser = async (req, res) => {
  const { wallet } = req.body;
  try {
    const user = await User.findOne({ wallet });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.isApproved = true;
    await user.save();
    res.status(200).json({ message: "User approved successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkAdmin = async (req, res) => {
  try {
    // If the middleware passes, the user is an admin
    res.status(200).json({ isAdmin: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkManufacturer = async (req, res) => {
  try {
    const wallet = req.session.wallet; // Get wallet from session
    const user = await User.findOne({ wallet });
    if (!user || user.role !== "Manufacturer" || !user.isApproved) {
      return res.status(403).json({ isApproved: false });
    }
    res.status(200).json({ isApproved: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const checkDistributor = async (req, res) => {
  try {
    const wallet = req.session.wallet; // Get wallet from session
    const user = await User.findOne({ wallet });
    if (!user || user.role !== "Distributor" || !user.isApproved) {
      return res.status(403).json({ isApproved: false });
    }
    res.status(200).json({ isApproved: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update the exports to include the new function
export default { 
  login, 
  register, 
  getPendingRequests, 
  approveUser, 
  checkAdmin, 
  checkManufacturer,
  checkDistributor 
};