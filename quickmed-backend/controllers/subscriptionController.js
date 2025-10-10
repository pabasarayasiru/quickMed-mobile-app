import { db } from "../firebase.js";

export const subscribeToPharmacy = async (req, res) => {
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
      .set({ userId, subscribedAt: new Date() });

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
