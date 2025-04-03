import { Router } from "express";
import { approveUserRequest, getPendingRequests ,getApprovedUsers,getInventory,getPendingDrugs,approveUser,rejectUser} from "../controllers/adminController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js"; // Import verifyAdmin
import authController from "../controllers/authController.js"; // Import authController for checkManufacturer

const router = Router();

// Use the named exports from adminController
router.get("/pending-requests", verifyAdmin, getPendingRequests);
router.post("/approve-user", verifyAdmin,approveUser);
router.post("/reject-user",verifyAdmin, rejectUser); // New route
router.get("/pending",verifyAdmin,getPendingDrugs);
router.get("/approved-users",verifyAdmin,getApprovedUsers);

router.get("/inventory",verifyAdmin,getInventory);

// Use authController for check-admin and check-manufacturer
router.get("/check-admin", verifyAdmin, (req, res) => {
  res.status(200).json({ message: "You are an admin!" });
});
router.get("/check-manufacturer", verifyAdmin, authController.checkManufacturer);

export default router;