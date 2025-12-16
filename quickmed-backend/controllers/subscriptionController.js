import { db } from "../firebase.js";

export const subscribeToPharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { userId, expoPushToken } = req.body;

    console.log(`🏥 Subscribe to pharmacy request: pharmacyId=${pharmacyId}, userId=${userId}, token=${expoPushToken?.substring(0, 30)}...`);

    if (!pharmacyId || !userId) {
      console.error("❌ Missing pharmacyId or userId");
      return res.status(400).json({ error: "Missing pharmacyId or userId" });
    }

    if (!expoPushToken) {
      console.error("❌ Missing expoPushToken");
      return res.status(400).json({ error: "Missing expoPushToken" });
    }

    // Check if subscription already exists
    const existingSubs = await db
      .collection("subscribe_pharmacy")
      .where("userId", "==", userId)
      .where("pharmacyId", "==", pharmacyId)
      .get();

    if (!existingSubs.empty) {
      // Update existing subscription
      const docRef = existingSubs.docs[0].ref;
      await docRef.update({
        expoPushToken,
        updatedAt: new Date(),
      });
      console.log(`Updated existing pharmacy subscription for user ${userId}, pharmacy ${pharmacyId}`);
      return res.json({ success: true, message: "Subscription updated" });
    }

    // Create new subscription if doesn't exist
    await db.collection("subscribe_pharmacy").add({
      userId,
      pharmacyId,
      expoPushToken,
      subscribedAt: new Date(),
    });

    console.log(`✅ Successfully subscribed user ${userId} to pharmacy ${pharmacyId}`);
    res.json({ success: true, message: "Subscribed to pharmacy" });
  } catch (error) {
    console.error("❌ Subscribe to pharmacy error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const unsubscribeFromPharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { userId } = req.body;

    if (!pharmacyId || !userId)
      return res.status(400).json({ error: "Missing pharmacyId or userId" });

    // Find and delete subscription
    const subsQuery = await db
      .collection("subscribe_pharmacy")
      .where("userId", "==", userId)
      .where("pharmacyId", "==", pharmacyId)
      .get();

    if (!subsQuery.empty) {
      await subsQuery.docs[0].ref.delete();
      console.log(`Unsubscribed user ${userId} from pharmacy ${pharmacyId}`);
    }

    res.json({ success: true, message: "Unsubscribed from pharmacy" });
  } catch (error) {
    console.error("❌ Unsubscribe from pharmacy error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const subscribeMedicine = async (req, res) => {
  try {
    const { userId, medicine, expoPushToken } = req.body;

    if (!userId || !medicine || !expoPushToken) {
      return res.status(400).json({
        success: false,
        message: "Missing data",
      });
    }

    const medicineQuery = medicine.toLowerCase();

    // Check if subscription already exists
    const existingSubs = await db
      .collection("medicine_subscriptions")
      .where("userId", "==", userId)
      .where("medicine", "==", medicineQuery)
      .get();

    if (!existingSubs.empty) {
      // Update existing subscription (don't create duplicate)
      const docRef = existingSubs.docs[0].ref;
      await docRef.update({
        pushToken: expoPushToken,
        notified: false, // Reset notified flag in case token changed
        updatedAt: new Date(),
      });
      console.log(`Updated existing subscription for user ${userId}, medicine ${medicineQuery}`);
      return res.json({ success: true, message: "Subscription updated" });
    }

    // Create new subscription if doesn't exist
    await db.collection("medicine_subscriptions").add({
      userId,
      medicine: medicineQuery,
      pushToken: expoPushToken,
      notified: false,
      createdAt: new Date(),
    });

    console.log(`Created new subscription for user ${userId}, medicine ${medicineQuery}`);
    return res.json({ success: true, message: "Subscription created" });
  } catch (error) {
    console.error("Subscribe backend error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

