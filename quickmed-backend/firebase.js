import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

// Initialize only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const messaging = admin.messaging();

export { admin, db, messaging };
