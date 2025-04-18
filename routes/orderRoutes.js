import { Router } from "express";
import orderController from "../controllers/orderController.js";
const router = Router();

router.post("/:drugId/request-order", orderController.requestOrder);
router.get("/available", orderController.getAvailableDrugs);
router.get("/orders/:wallet", orderController.getDistributorOrders);


// In your drugRoutes.js
router.patch("/:drugId/update-status", orderController.updateDrugStatus);

export default router;