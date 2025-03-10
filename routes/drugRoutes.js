import { Router } from "express";
import drugController from "../controllers/drugController.js";

const router = Router();

router.post("/submit-drug", drugController.submitDrugRequest);
router.post("/save-drug-data", drugController.saveDrugData);

router.get("/:transactionId", drugController.getDrugDetails); 

export default router;