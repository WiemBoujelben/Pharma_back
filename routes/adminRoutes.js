import { Router } from "express";
import {getPendingRequests ,getPendingOrders,approveOrder,rejectOrder,getAllOrders,getApprovedUsers,getInventory,getPendingDrugs,approveUser,rejectUser,saveAdminDrugData,getAllAdminDrugs} from "../controllers/adminController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js"; // Import verifyAdmin
import authController from "../controllers/authController.js"; // Import authController for checkManufacturer
import fileUpload from 'express-fileupload';

const router = Router();
router.use(fileUpload());


/////////////////Order management routes////////////////////
router.get("/orders/pending", verifyAdmin, getPendingOrders);
router.put("/orders/:orderId/approve", verifyAdmin, approveOrder);
router.put("/orders/:orderId/reject", verifyAdmin, rejectOrder);
router.get("/orders", verifyAdmin, getAllOrders);

///////////////user managment//////////////////
router.get("/pending-requests", verifyAdmin, getPendingRequests);
router.post("/approve-user", verifyAdmin,approveUser);
router.post("/reject-user",verifyAdmin, rejectUser); // New route
router.get("/pending",verifyAdmin,getPendingDrugs);
router.get("/approved-users",verifyAdmin,getApprovedUsers);

router.get("/inventory",verifyAdmin,getInventory);
///////////////submitting drug from abroad routes//////////////////////
router.post("/save-admin-drug-data",verifyAdmin,saveAdminDrugData);
router.get("/drugs", verifyAdmin,getAllAdminDrugs);
// Use authController for check-admin and check-manufacturer
router.get("/check-admin", verifyAdmin, (req, res) => {
  res.status(200).json({ message: "You are an admin!" });
});
router.get("/check-manufacturer", verifyAdmin, authController.checkManufacturer);

export default router;