import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";
import AppNavigator from "./src/navigation/AppNavigator";
import { registerForPushNotificationsAsync } from "./src/services/notifications";

export default function App() {
  useEffect(() => {
    // Register for push notifications when app starts
    (async () => {
      try {
        await registerForPushNotificationsAsync();
      } catch (err) {
        console.error("Failed to register for push notifications:", err);
      }
    })();

    // Log notifications received while the app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📬 Notification received (foreground):", notification);
        console.log("Title:", notification.request.content.title);
        console.log("Body:", notification.request.content.body);
      }
    );

    // Log when a user interacts with a notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("👆 Notification tapped:", response.notification.request.content);
      }
    );

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return <AppNavigator />;
}
