import User from "../models/User.js";
import Drug from "../models/Drug.js";
import Order from "../models/Order.js";
import { 
  storeDrugMetadata, 
  generateQRCode,
  retrieveDrugMetadata
} from "../services/ipfsService.js";
//order management
// Get pending orders
export const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Requested" })
      .populate('drugId', 'name price quantity pctCode currentHolder');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve order
export const approveOrder = async (req, res) => {
  const { orderId } = req.params;
  const { transactionId, approvedBy } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Requested") {
      return res.status(400).json({ message: "Order is not in requested state" });
    }

    // Update order status
    order.status = "Approved";
    order.approvalTransactionId = transactionId;
    order.approvalHashScanLink = `https://hashscan.io/testnet/transaction/${transactionId}`;
    order.approvedBy = approvedBy;
    await order.save();

    // Update drug status
    await Drug.findByIdAndUpdate(order.drugId, {
      orderStatus: "Approved",
      currentHolder: order.distributor,
      $push: {
        history: {
          holder: order.distributor,
          timestamp: Math.floor(Date.now() / 1000),
          role: "Distributor"
        }
      }
    });

    res.status(200).json({ 
      message: "Order approved successfully",
      order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject order
export const rejectOrder = async (req, res) => {
  const { orderId } = req.params;
  const { transactionId, approvedBy, rejectionReason } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Requested") {
      return res.status(400).json({ message: "Order is not in requested state" });
    }

    // Update order status
    order.status = "Rejected";
    order.approvalTransactionId = transactionId;
    order.approvalHashScanLink = `https://hashscan.io/testnet/transaction/${transactionId}`;
    order.approvedBy = approvedBy;
    order.rejectionReason = rejectionReason || "Not specified";
    await order.save();

    // Update drug status to make it available again
    await Drug.findByIdAndUpdate(order.drugId, {
      orderStatus: "None",
      orderedBy: null
    });

    res.status(200).json({ 
      message: "Order rejected successfully",
      order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders (for admin dashboard)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('drugId', 'name price quantity pctCode')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const saveAdminDrugData = async (req, res) => {
  const { 
    name, price, expiryDate, countryOfOrigin, 
    countryOfProvenance, quantity, transactionId, 
    hashScanLink, currentHolder, pctCode
  } = req.body;

  try {
    // Prepare metadata for IPFS
    const metadata = {
      name,
      price,
      expiryDate,
      countryOfOrigin,
      countryOfProvenance,
      quantity,
      transactionId,
      centralPharmacy: currentHolder,
      pctCode,
      timestamp: Math.floor(Date.now() / 1000)
    };

    // Store metadata to IPFS
    const cid = await storeDrugMetadata(metadata);
    
    // Generate QR code
    const qrCodePath = await generateQRCode(cid, name);

    const drug = new Drug({
      name,
      price,
      expiryDate,
      countryOfOrigin,
      countryOfProvenance,
      quantity,
      transactionId,
      hashScanLink,
      currentHolder,
      pctCode,
      history: [{
        holder: currentHolder,
        timestamp: Math.floor(Date.now() / 1000),
        role: "CentralPharmacy"
      }],
      status: "Approved",
      cid,
      qrCodePath
    });

    await drug.save();
    res.status(200).json({ 
      message: "Admin drug data saved successfully", 
      drug,
      qrCodeUrl: qrCodePath
    });
  } catch (err) {
    console.error("Error saving admin drug data:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAllAdminDrugs = async (req, res) => {
  try {
    // Get drugs submitted by admin (where initial holder is CentralPharmacy)
    const drugs = await Drug.find({
      "history.0.role": "CentralPharmacy"
    });
    res.status(200).json(drugs);
  } catch (err) {
    console.error("Error fetching admin drugs:", err);
    res.status(500).json({ message: err.message });
  }
};
// Use named exports


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