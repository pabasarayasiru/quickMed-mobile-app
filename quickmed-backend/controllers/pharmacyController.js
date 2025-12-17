import { db, admin } from "../firebase.js";
import { sendPushNotifications } from "../utils/notifications.js";

// Register pharmacy
export const registerPharmacy = async (req, res) => {
  try {
    const { uid, name, phone, latitude, longitude } = req.body;

    if (!uid || !name || !phone || !latitude || !longitude) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await admin.firestore().collection("pharmacies").doc(uid).set({
      name,
      role: "pharmacy",
      phone,
      location: new admin.firestore.GeoPoint(Number(latitude), Number(longitude)),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get pharmacy by ID
export const getPharmacyById = async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    if (!pharmacyId) {
      return res.status(400).json({ success: false, error: "Pharmacy ID required" });
    }
    const doc = await db.collection("pharmacies").doc(pharmacyId).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Pharmacy not found" });
    }
    const data = { id: doc.id, ...doc.data() };
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("Error fetching pharmacy:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Add stock 
export const addStock = async (req, res) => {
  try {
    const { pharmacyId, medicine, quantity } = req.body;
    if (!pharmacyId || !medicine || !quantity)
      return res.status(400).json({ error: "Missing fields" });

    const stockRef = db.collection("pharmacies").doc(pharmacyId).collection("stock").doc(medicine.toLowerCase());
    const pharmacyRef = db.collection("pharmacies").doc(pharmacyId);
    const snapshot = await stockRef.get();

    
    const pharmacySnap = await pharmacyRef.get();
    const pharmacyData = pharmacySnap.data();
    const pharmacyName = pharmacyData?.name || "Pharmacy";

    if (snapshot.exists) {
      return res.status(400).json({ error: "Medicine already exists. Use update instead." });
    }

    await stockRef.set({
      name: medicine.toLowerCase(),    
      displayName: medicine,          
      quantity,
    });



    // Collect all subscriber tokens
    const subsSnap = await db
      .collection("subscribe_pharmacy")
      .where("pharmacyId", "==", pharmacyId)
      .get();

    const tokens = [];
    subsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.expoPushToken) {
        tokens.push(data.expoPushToken);
      }
    });

    // Send notification 
    await sendPushNotifications(
      tokens,
      "New Medicine Added 💊",
      `${medicine} is now available at ${pharmacyName} pharmacy.`
    );


    // Notify users who subscribed to this specific medicine
    try {
      const medicineQuery = medicine.toLowerCase();
      console.log(`🔍 Querying for subscriptions: medicine="${medicineQuery}", notified=false`);

      const medicineSubs = await db
        .collection("medicine_subscriptions")
        .where("medicine", "==", medicineQuery)
        .where("notified", "==", false)
        .get();

      console.log(`Found ${medicineSubs.docs.length} subscriptions for medicine: ${medicine}`);

      if (!medicineSubs.empty) {
        for (const doc of medicineSubs.docs) {
          const sub = doc.data();
          console.log(`Notifying user ${sub.userId} about ${medicine}`);

          await sendPushNotifications(
            [sub.pushToken],
            "💊 Medicine Available!",
            `${medicine} is now available at ${pharmacyName}`
          );

          // Delete subscription after notifying (cleanup)
          await doc.ref.delete();
          console.log(`🗑️ Deleted subscription for user: ${sub.userId}`);
        }
      } else {
        console.log(`No pending subscriptions for medicine: ${medicine}`);
      }
    } catch (err) {
      console.error("❌ Medicine subscription notification failed:", err.message);
    }

    res.json({
      success: true,
      message: "Medicine added and subscribers notified.",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





// Update stock
export const updateStock = async (req, res) => {
  try {
    const { pharmacyId, medicine, quantity } = req.body;
    if (!pharmacyId || !medicine || !quantity)
      return res.status(400).json({ error: "Missing fields" });

    const stockRef = db
      .collection("pharmacies")
      .doc(pharmacyId)
      .collection("stock")
      .doc(medicine.toLowerCase());

    const docSnap = await stockRef.get();
    if (!docSnap.exists) return res.status(404).json({ error: "Medicine not found" });

    await stockRef.update({ quantity });
    res.json({ success: true, message: "Stock updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





// Get all stock
export const getStock = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const snapshot = await db.collection("pharmacies").doc(pharmacyId).collection("stock").get();
    const stock = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, stock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





// Get stock by medicine id
export const getStockById = async (req, res) => {
  try {
    const { pharmacyId, medicineId } = req.params;
    const docSnap = await db.collection("pharmacies").doc(pharmacyId).collection("stock").doc(medicineId).get();

    if (!docSnap.exists) return res.status(404).json({ error: "Medicine not found" });

    res.json({ success: true, stock: { id: docSnap.id, ...docSnap.data() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Delete stock by medicine id
export const deleteStockById = async (req, res) => {
  try {
    const { pharmacyId, medicineId } = req.params;
    const docRef = db.collection("pharmacies").doc(pharmacyId).collection("stock").doc(medicineId);
    const pharmacyRef = db.collection("pharmacies").doc(pharmacyId);

    const medSnap = await docRef.get();
    if (!medSnap.exists) return res.status(404).json({ error: "Medicine not found" });

    const medicineData = medSnap.data();
    const medicineName = medicineData.medicineName || medicineData.name || "Medicine";
    
    
    const pharmacySnap = await pharmacyRef.get();
    const pharmacyData = pharmacySnap.data();
    const pharmacyName = pharmacyData?.name || "Pharmacy";
    
    const docSnap = await docRef.get();
    if (!docSnap.exists) return res.status(404).json({ error: "Medicine not found" });

    await docRef.delete();


    // Collect all subscriber tokens
    const subsSnap = await db
      .collection("subscribe_pharmacy")
      .where("pharmacyId", "==", pharmacyId)
      .get();

      const tokens = [];
      subsSnap.forEach((doc) => {
        const data = doc.data();
        if (data.expoPushToken) {
          tokens.push(data.expoPushToken);
        }
      });

      // Send notification 
      await sendPushNotifications(
        tokens,
        "Stock Removed",
        `${medicineName} is no longer available at ${pharmacyName} pharmacy.`
      );

      res.json({
        success: true,
        message: "Medicine removed and subscribers notified.",
      });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Search stock lowercase
export const searchStock = async (req, res) => {
  try {
    const { pharmacyId } = req.params || { pharmacyId: "f2pYnnSxQGNwszhjF6G9BjHgOWw2" };
    const { name } = req.query;

    console.log("name:", name);
    if (!name) return res.status(400).json({ error: "Missing search name" });


    const snapshot = await db
      .collection("pharmacies")
      .doc(pharmacyId)
      .collection("stock")
      .get();

    const searchText = name.toLowerCase();

    const results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => {
        const field = item.name || item.displayName || "";
        return field.toLowerCase().includes(searchText);
      });


    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Search pharmacies by name
export const searchPharmacies = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: "Missing search name" });

    const snapshot = await db.collection("pharmacies").get();
    const searchText = name.toLowerCase();

    const results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(pharmacy => {
        const words = pharmacy.name.toLowerCase().split(/\s+/);
        return words.some(word => word.startsWith(searchText));
      });

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Get all pharmacies
export const getAllPharmacies = async (req, res) => {
  try {
    const snapshot = await db.collection("pharmacies")
    .select("name", "phone", "location")
    .get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





