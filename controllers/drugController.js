import Drug from "../models/Drug.js";

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

// controllers/drugController.js
const saveDrugData = async (req, res) => {
  const { 
    name, price, expiryDate, countryOfOrigin, 
    countryOfProvenance, quantity, transactionId, 
    hashScanLink, currentHolder 
  } = req.body;

  try {
    const drug = new Drug({
      name,
      price,
      expiryDate,
      countryOfOrigin,
      countryOfProvenance,
      quantity, // Ensure this is included
      transactionId,
      hashScanLink,
      currentHolder,
      history: [{
        holder: currentHolder,
        timestamp: Math.floor(Date.now() / 1000),
        role: "Manufacturer"
      }],
      status: "Pending"
    });

    await drug.save();
    res.status(200).json({ message: "Drug data saved successfully", drug });
  } catch (err) {
    console.error("Error saving drug data:", err);
    res.status(500).json({ message: err.message });
  }
};

export default { getDrugDetails, saveDrugData, getAllDrugs };