import express from "express";
import { listMedicineSubscriptions, sendTestPush } from "../controllers/debugController.js";

const router = express.Router();

router.get("/medicine-subs", listMedicineSubscriptions);
router.post("/send-test", sendTestPush);

export default router;
