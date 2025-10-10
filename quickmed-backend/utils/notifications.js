import fetch from "node-fetch";

export async function sendPushNotification(expoPushToken, title, body) {
  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
    };

    // Expo Push endpoint — no need for FCM directly in Expo client
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    console.log("Expo push response:", data);
  } catch (error) {
    console.error("Error sending push:", error);
  }
}
