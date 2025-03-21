import { Router } from "express";
import drugController from "../controllers/drugController.js";

const router = Router();


router.post("/save-drug-data", drugController.saveDrugData);

router.get("/:transactionId", drugController.getDrugDetails);
router.get("/", drugController.getAllDrugs);

export default router;