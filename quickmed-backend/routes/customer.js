import express from "express";
import { searchMedicine,registerCustomer,getCustomer } from "../controllers/customerController.js";

const router = express.Router();

router.post("/register", registerCustomer);
router.get("/search", searchMedicine);
router.get("/:uid", getCustomer);

export default router;
