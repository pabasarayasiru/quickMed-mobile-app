// services/mobileNotifications.js
import * as Network from "expo-network";
import * as Location from "expo-location";
import { showLocalNotification } from "./notifications";

export async function monitorMobileContext() {


  let lastState = null;

  setInterval(async () => {
    const net = await Network.getNetworkStateAsync();

    if (lastState !== null && lastState !== net.isConnected) {
      if (!net.isConnected) showLocalNotification("⚠ Offline", "You lost connection");
      else showLocalNotification("🌐 Online", "Internet restored");
    }
    lastState = net.isConnected;
  }, 4000); // check every 4s





  const gps = await Location.hasServicesEnabledAsync();
  if (!gps) {
    showLocalNotification("📵 GPS Disabled", "Turn on location for best results");
  }
}
