import Drug from "../models/Drug.js";
import hederaService from "../services/hederaService.js";
const getAllDrugs = async (req, res) => {
  try {
    const drugs = await Drug.find(); // Fetch all drugs from MongoDB
    res.status(200).json(drugs);
  } catch (err) {
    console.error("Error fetching drugs:", err);
    res.status(500).json({ message: err.message });
  }
};
// Fetch drug details by transactionId
const getDrugDetails = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const drug = await Drug.findOne({ transactionId });
    if (!drug) {
      return res.status(404).json({ message: "Drug not found" });
    }

    res.status(200).json(drug);
  } catch (err) {
    console.error("Error fetching drug details:", err);
    res.status(500).json({ message: err.message });
  }
};



// Generate unsigned transaction
const submitDrugRequest = async (req, res) => {
  const { name, price, expiryDate, countryOfOrigin, countryOfProvenance, wallet } = req.body;

  try {
    // Generate unsigned transaction data
    const transactionHex = await hederaService.generateUnsignedTx({
      name,
      price,
      expiryDate,
      countryOfOrigin,
      countryOfProvenance,
      wallet,
    });

    res.status(200).json({
      message: "Unsigned transaction generated",
      transactionHex, // Send the hex-encoded transaction to the frontend
    });
  } catch (err) {
    console.error("Error generating unsigned transaction:", err);
    res.status(500).json({ message: err.message });
  }
};



const saveDrugData = async (req, res) => {
  const { name, price, expiryDate, countryOfOrigin, countryOfProvenance, transactionId, hashScanLink } = req.body;

  console.log("Received request body:", req.body); // Log the request body

  try {
    // Save the drug to MongoDB with transaction details
    const drug = new Drug({
      name,
      price,
      expiryDate,
      countryOfOrigin,
      countryOfProvenance,
      transactionId,
      hashScanLink,
    });
    await drug.save();

    res.status(200).json({
      message: "Drug data saved successfully",
      drug,
    });
  } catch (err) {
    console.error("Error saving drug data:", err);
    res.status(500).json({ message: err.message });
  }
};



export default { submitDrugRequest ,getDrugDetails,saveDrugData,getAllDrugs};