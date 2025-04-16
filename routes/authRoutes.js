import { Router } from "express";
import authController from "../controllers/authController.js";
import { verifyAdmin, verifyManufacturer ,verifyDistributor} from "../middleware/authMiddleware.js"; // Import verifyAdmin and verifyManufacturer

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/check-admin", verifyAdmin, (req, res) => {
  res.status(200).json({ isAdmin: true });
});
router.get("/check-manufacturer", verifyManufacturer, authController.checkManufacturer);
router.get("/check-distributor", verifyDistributor, (req, res) => {
  res.status(200).json({ isDistributor: true });
});
export default router;