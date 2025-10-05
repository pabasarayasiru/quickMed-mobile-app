import { db, admin } from "../firebase.js";


// Register customer
export const registerCustomer = async (req, res) => {
  try {
    const { uid, email } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: "Missing uid or email" });
    }

    await db.collection("customers").doc(uid).set({
      email,
      role: "customer",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "Customer registered" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Get customer profile
export const getCustomer = async (req, res) => {
  try {
    const { uid } = req.params;
    const doc = await db.collection("customers").doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ success: true, customer: doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Search medicine across pharmacies (partial + case-insensitive)
export const searchMedicine = async (req, res) => {
  try {
    const { medicine } = req.query;
    if (!medicine || !medicine.trim()) {
      return res.status(400).json({ error: "Missing medicine" });
    }
    const searchKey = medicine.trim().toLowerCase();

    const pharmaciesSnapshot = await db.collection("pharmacies").get();
    const results = [];

    for (const pharmacyDoc of pharmaciesSnapshot.docs) {
      const stockSnapshot = await db
        .collection("pharmacies")
        .doc(pharmacyDoc.id)
        .collection("stock")
        .get();

      // Filter medicines locally (case-insensitive, partial match)
      stockSnapshot.docs.forEach((stockDoc) => {
        const stockData = stockDoc.data();
        const medName = stockData.name.toLowerCase().trim();

        if (medName.includes(searchKey)) {  
          results.push({
            pharmacyId: pharmacyDoc.id,
            pharmacyName: pharmacyDoc.data().name,
            phone: pharmacyDoc.data().phone,
            location: pharmacyDoc.data().location,
            medicine: stockData.displayName || stockData.name,
            stock: stockData.quantity,
          });
        }
      });
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
};
