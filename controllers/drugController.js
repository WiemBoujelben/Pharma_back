// controllers/drugController.js
import Drug from "../models/Drug.js";
import { 
  storeDrugMetadata, 
  generateQRCode,
  verifyQRCode,
  retrieveDrugMetadata
} from "../services/ipfsService.js";

const getAllDrugs = async (req, res) => {
  try {
    const drugs = await Drug.find();
    res.status(200).json(drugs);
  } catch (err) {
    console.error("Error fetching drugs:", err);
    res.status(500).json({ message: err.message });
  }
};

const getDrugDetails = async (req, res) => {
  const { transactionId } = req.params;
  try {
    const drug = await Drug.findOne({ transactionId });
    if (!drug) return res.status(404).json({ message: "Drug not found" });
    res.status(200).json(drug);
  } catch (err) {
    console.error("Error fetching drug details:", err);
    res.status(500).json({ message: err.message });
  }
};

const saveDrugData = async (req, res) => {
  const { 
    name, price, expiryDate, countryOfOrigin, 
    countryOfProvenance, quantity, transactionId, 
    hashScanLink, currentHolder 
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
      manufacturer: currentHolder,
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
      history: [{
        holder: currentHolder,
        timestamp: Math.floor(Date.now() / 1000),
        role: "Manufacturer"
      }],
      status: "Pending",
      cid,
      qrCodePath
    });

    await drug.save();
    res.status(200).json({ 
      message: "Drug data saved successfully", 
      drug,
      qrCodeUrl: qrCodePath
    });
  } catch (err) {
    console.error("Error saving drug data:", err);
    res.status(500).json({ message: err.message });
  }
};

const verifyDrug = async (req, res) => {
  try {
    if (!req.files || !req.files.qrImage) {
      return res.status(400).json({ 
        success: false, 
        error: 'No QR code image uploaded' 
      });
    }

    // Verify QR code and get CID
    const cid = await verifyQRCode(req.files.qrImage.data);
    
    // Retrieve metadata from IPFS
    const ipfsMetadata = await retrieveDrugMetadata(cid);
    
    // Find the drug in our database
    const drug = await Drug.findOne({ cid });
    
    if (!drug) {
      return res.status(404).json({
        success: false,
        message: "Drug not found in database",
        ipfsMetadata
      });
    }

    res.json({
      success: true,
      message: "Drug verified successfully",
      drug,
      ipfsMetadata
    });
  } catch (error) {
    console.error('Verification failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message.includes('decode') 
        ? 'Failed to decode QR code. Please ensure you uploaded a valid QR code image.'
        : error.message
    });
  }
};

// Approve drug
const approveDrug = async (req, res) => {
  const { transactionId } = req.params;
  const { pctCode, transactionId: approvalTxId, approvedBy } = req.body;

  try {
    const drug = await Drug.findOne({ transactionId });
    if (!drug) {
      return res.status(404).json({ message: "Drug not found" });
    }

    drug.status = "Approved";
    drug.pctCode = pctCode;
    drug.approvalTransactionId = approvalTxId;
    drug.approvalHashScanLink = `https://hashscan.io/testnet/transaction/${approvalTxId}`;
    
    // Add approval to history
    drug.history.push({
      holder: approvedBy,
      timestamp: Math.floor(Date.now() / 1000),
      role: "CentralPharmacy"
    });

    await drug.save();
    res.status(200).json({ message: "Drug approved successfully", drug });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject drug
const rejectDrug = async (req, res) => {
  const { transactionId } = req.params;
  const { transactionId: rejectionTxId, rejectedBy } = req.body;

  try {
    const drug = await Drug.findOne({ transactionId });
    if (!drug) {
      return res.status(404).json({ message: "Drug not found" });
    }

    drug.status = "Rejected";
    drug.rejectionTransactionId = rejectionTxId;
    drug.rejectionHashScanLink = `https://hashscan.io/testnet/transaction/${rejectionTxId}`;
    
    // Add rejection to history
    drug.history.push({
      holder: rejectedBy,
      timestamp: Math.floor(Date.now() / 1000),
      role: "CentralPharmacy-Rejected"
    });

    await drug.save();
    res.status(200).json({ message: "Drug rejected successfully", drug });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Update the exports at the bottom:
export default { 
  getDrugDetails, 
  saveDrugData, 
  getAllDrugs,
  verifyDrug,
  
  approveDrug,
  rejectDrug,
 // Add this
};