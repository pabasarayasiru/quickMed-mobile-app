import express from "express";
import {
  registerPharmacy,
  addStock,
  updateStock,
  getStock,
  getStockById,
  deleteStockById,
  searchStock,
  searchPharmacies,
  getAllPharmacies,
  getNearestPharmacies,
  getPharmacyById,
} from "../controllers/pharmacyController.js";

import { subscribeToPharmacy, unsubscribeFromPharmacy } from "../controllers/subscriptionController.js";

const router = express.Router();

router.post("/register", registerPharmacy);
router.get("/search", searchPharmacies); 
router.get("/nearest", getNearestPharmacies); 
router.get("/allPharmacies", getAllPharmacies); 


router.post("/stock", addStock);                  
router.put("/stock/update", updateStock);               
router.get("/:pharmacyId/stock", getStock);       
router.get("/:pharmacyId/stock/search", searchStock);   
router.get("/:pharmacyId/stock/:medicineId", getStockById); 
router.delete("/:pharmacyId/stock/:medicineId", deleteStockById);


router.get("/:pharmacyId", getPharmacyById);
router.post("/:pharmacyId/subscribe", subscribeToPharmacy);
router.post("/:pharmacyId/unsubscribe", unsubscribeFromPharmacy);

export default router;
