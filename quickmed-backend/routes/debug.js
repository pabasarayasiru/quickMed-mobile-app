import express from "express";
import { listMedicineSubscriptions, listPharmacySubscriptions, sendTestPush } from "../controllers/debugController.js";

const router = express.Router();

router.get("/medicine-subs", listMedicineSubscriptions);
router.get("/pharmacy-subs", listPharmacySubscriptions);
router.post("/send-test", sendTestPush);

export default router;
