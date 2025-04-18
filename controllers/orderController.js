import Order from "../models/Order.js";
import Drug from "../models/Drug.js";

// Add these new functions to the existing drugController
// In your drugController.js
export const updateDrugStatus = async (req, res) => {
  const { drugId } = req.params;
  const { orderStatus, orderedBy } = req.body;

  try {
    const drug = await Drug.findByIdAndUpdate(
      drugId,
      { orderStatus, orderedBy },
      { new: true }
    );
    res.status(200).json(drug);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



const requestOrder = async (req, res) => {
  const { drugId } = req.params;
  const { wallet, transactionId } = req.body;

  try {
    const drug = await Drug.findById(drugId);
    if (!drug) {
      return res.status(404).json({ message: "Drug not found" });
    }

    if (drug.orderStatus !== "None") {
      return res.status(400).json({ message: "Drug is already ordered" });
    }

    drug.orderStatus = "Requested";
    drug.orderedBy = wallet;
    await drug.save();

    // Create order record
    const order = new Order({
      orderId: transactionId,
      drugId: drug._id,
      distributor: wallet,
      status: "Requested",
      transactionId,
      hashScanLink: `https://hashscan.io/testnet/transaction/${transactionId}`
    });

    await order.save();

    res.status(200).json({ 
      message: "Order requested successfully",
      drug,
      order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAvailableDrugs = async (req, res) => {
  try {
    const drugs = await Drug.find({ 
      status: "Approved",
      orderStatus: "None"
    });
    res.status(200).json(drugs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDistributorOrders = async (req, res) => {
  const { wallet } = req.params;
  try {
    const orders = await Order.find({ distributor: wallet })
      .populate('drugId', 'name price quantity pctCode');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add these to the exports at the bottom
export default {
  updateDrugStatus,
  requestOrder,
  getAvailableDrugs,
  getDistributorOrders
};