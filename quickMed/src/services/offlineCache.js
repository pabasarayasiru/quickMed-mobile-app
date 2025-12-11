import AsyncStorage from "@react-native-async-storage/async-storage";

// Save data
export const saveCache = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.log("Cache Save Error:", err);
  }
};

// Load cached data
export const loadCache = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.log("Cache Load Error:", err);
    return null;
  }
};

// Check if online
export const isOnline = async () => {
  try {
    const response = await fetch("https://www.google.com", { method: "HEAD" });
    return response.ok;
  } catch (err) {
    return false;
  }
};
