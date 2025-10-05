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
} from "../controllers/pharmacyController.js";

const router = express.Router();

router.post("/register", registerPharmacy);
router.post("/stock", addStock);                  
router.put("/stock/update", updateStock);               

router.get("/:pharmacyId/stock", getStock);       
router.get("/:pharmacyId/stock/search", searchStock);   
router.get("/:pharmacyId/stock/:medicineId", getStockById); 
router.delete("/:pharmacyId/stock/:medicineId", deleteStockById);

router.get("/search", searchPharmacies); 
router.get("/nearest", getNearestPharmacies); 
router.get("/allPharmacies", getAllPharmacies); 

export default router;
