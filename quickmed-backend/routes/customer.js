import express from "express";
import { searchMedicine,registerCustomer,getCustomer } from "../controllers/customerController.js";
import { subscribeMedicine } from "../controllers/subscriptionController.js"

const router = express.Router();

router.post("/register", registerCustomer);
router.get("/search", searchMedicine);
router.get("/:uid", getCustomer);
router.post("/subscribe-medicine",subscribeMedicine)

export default router;
