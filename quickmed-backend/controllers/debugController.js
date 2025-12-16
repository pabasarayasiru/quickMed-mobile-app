import { db } from "../firebase.js";
import { sendPushNotifications } from "../utils/notifications.js";

export const listMedicineSubscriptions = async (req, res) => {
  try {
    const snap = await db
      .collection("medicine_subscriptions")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json({ success: true, results });
  } catch (err) {
    console.error("Debug listMedicineSubscriptions error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const sendTestPush = async (req, res) => {
  try {
    const { token, title = "Test", body = "Test push" } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "token required" });

    const result = await sendPushNotifications([token], title, body);
    return res.json({ success: true, result });
  } catch (err) {
    console.error("Debug sendTestPush error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
