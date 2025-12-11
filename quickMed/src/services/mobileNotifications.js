// services/mobileNotifications.js
import * as Network from "expo-network";
import * as Location from "expo-location";
import { showLocalNotification } from "./notifications";

export async function monitorMobileContext() {

  /* --------------------- 📡 INTERNET MONITOR --------------------- */
  let lastState = null;

  setInterval(async () => {
    const net = await Network.getNetworkStateAsync();

    if (lastState !== null && lastState !== net.isConnected) {
      if (!net.isConnected) showLocalNotification("⚠ Offline", "You lost connection");
      else showLocalNotification("🌐 Online", "Internet restored");
    }
    lastState = net.isConnected;
  }, 4000); // check every 4s




  /* --------------------- 📍 GPS + MOVEMENT + GEOFENCE --------------------- */
  Location.watchPositionAsync(
    { accuracy: 4, distanceInterval: 20 }, // update every 20m
    pos => {
      const { latitude, longitude, speed } = pos.coords;
      console.log("📍", latitude, longitude, "🚗 Speed:", speed);

      // 🔥 GEOFENCE EXAMPLE (Sri Lanka Colombo Zone Sample)
      if(latitude > 6.880 && latitude < 6.940 && longitude > 79.850 && longitude < 79.910){
        showLocalNotification("🏥 Pharmacy Zone", "Nearby pharmacies detected");
      }

      // 🔥 MOVING FAST > 15 km/h
      if(speed > 4.16){
        showLocalNotification("🚗 Traveling Mode", "You're moving fast");
      }
    }
  );



  /* --------------------- 🛰 GPS ENABLED? --------------------- */
  const gps = await Location.hasServicesEnabledAsync();
  if (!gps) {
    showLocalNotification("📵 GPS Disabled", "Turn on location for best results");
  }
}
