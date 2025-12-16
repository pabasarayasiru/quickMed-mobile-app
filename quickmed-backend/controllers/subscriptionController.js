import { db } from "../firebase.js";

export const subscribeToPharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { userId , expoPushToken } = req.body;

    if (!pharmacyId || !userId)
      return res.status(400).json({ error: "Missing pharmacyId or userId" });

    await db
      .collection("pharmacies")
      .doc(pharmacyId)
      .collection("subscribers")
      .doc(userId)
      .set({ userId, expoPushToken, subscribedAt: new Date() });

    res.json({ success: true, message: "Subscribed to pharmacy" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const unsubscribeFromPharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { userId } = req.body;

    if (!pharmacyId || !userId)
      return res.status(400).json({ error: "Missing pharmacyId or userId" });

    await db
      .collection("pharmacies")
      .doc(pharmacyId)
      .collection("subscribers")
      .doc(userId)
      .delete();

    res.json({ success: true, message: "Unsubscribed from pharmacy" });
  } catch (error) {
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

