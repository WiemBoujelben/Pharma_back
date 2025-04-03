import { Router } from "express";
import drugController from "../controllers/drugController.js";

import fileUpload from 'express-fileupload';
const router = Router();
router.use(fileUpload());

router.post("/save-drug-data", drugController.saveDrugData);
router.post("/verify", drugController.verifyDrug);
router.get("/:transactionId", drugController.getDrugDetails);
router.get("/", drugController.getAllDrugs);

router.post("/:transactionId/approve", drugController.approveDrug);
router.post("/:transactionId/reject", drugController.rejectDrug);

export default router;