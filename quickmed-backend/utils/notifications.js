import fetch from "node-fetch";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Send push notifications to multiple tokens.
 * @param {string[]} tokens - Array of Expo push tokens.
 * @param {string} title - Notification title.
 * @param {string} body - Notification message body.
 */

export async function sendPushNotifications(tokens, title, body) {
  if (!tokens || tokens.length === 0) {
    console.log("No tokens to notify.");
    return;
  }

  try {
    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log("Push notification response:", result);
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }
}
