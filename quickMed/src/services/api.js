import { haversineDistance } from "../utils/distance";
import { registerForPushNotificationsAsync, getExpoPushToken } from "./notifications";
import { saveCache, loadCache, isOnline } from "./offlineCache";

const BASE_URL = "http://10.10.23.164:3000"; 



// Register pharmacy
export const registerPharmacy = async (uid, name, phone, latitude, longitude) => {
  try {
    const res = await fetch(`${BASE_URL}/pharmacy/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, name, phone, latitude, longitude }),
    });

    const data = await res.json();
    console.log("Backend response:", res.status, data);
    return data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};


// Get a single pharmacy by ID
export const getPharmacyById = async (pharmacyId) => {
  const res = await fetch(`${BASE_URL}/pharmacy/${pharmacyId}`);
  return res.json();
};



// Register customer
export const registerCustomer = async (uid, email) => {
  const res = await fetch(`${BASE_URL}/customer/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, email }),
  });
  return res.json();
};



// Get customer profile
export const getCustomer = async (uid) => {
  const res = await fetch(`${BASE_URL}/customer/${uid}`);
  return res.json();
};



// Add new stock
export const addStock = async (pharmacyId, medicine, quantity) => {
  const res = await fetch(`${BASE_URL}/pharmacy/stock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pharmacyId, medicine, quantity }),
  });
  return res.json();
};




// Update existing stock
export const updateStock = async (pharmacyId, medicine, quantity) => {
  const res = await fetch(`${BASE_URL}/pharmacy/stock/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pharmacyId, medicine, quantity }),
  });
  return res.json();
};



// Get a specific stock item by medicineId
export const getStockById = async (pharmacyId, medicineId) => {
  const res = await fetch(`${BASE_URL}/pharmacy/${pharmacyId}/stock/${medicineId}`);
  return res.json();
};




// Delete a stock item
export const deleteStock = async (pharmacyId, medicineId) => {
  const res = await fetch(`${BASE_URL}/pharmacy/${pharmacyId}/stock/${medicineId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
};



// Search medicine across pharmacies 

export const searchMedicine = async (medicine) => {
  const clean = medicine.trim();
  const cacheKey = `medicine_${clean.toLowerCase()}`;

  const online = await isOnline();

  if (!online) {
    console.log("OFFLINE → Loading cached medicine results");
    return { success: true, results: await loadCache(cacheKey) || [] };
  }

  const res = await fetch(
    `${BASE_URL}/customer/search?medicine=${encodeURIComponent(clean)}`
  );
  const data = await res.json();

  if (data.success) saveCache(cacheKey, data.results);

  return data;
};















// Get all stock for a pharmacy
export const getStock = async (pharmacyId) => {
  const res = await fetch(`${BASE_URL}/pharmacy/${pharmacyId}/stock`);
  return res.json();
};



// Search stock by medicine name
export const searchStock = async (pharmacyId, name) => {
  const res = await fetch(`${BASE_URL}/pharmacy/${pharmacyId}/stock/search?name=${encodeURIComponent(name)}`);
  const data = await res.json();

  return data;
};


// combined fetch stocks (all or search)
export const fetchStocks = async (pharmacyId, name = "") => {
  let res;
  if (!name) {
    res = await getStock(pharmacyId);
  } else {
    res = await searchStock(pharmacyId, name);
  }

  // Normalize response to array
  if (res.results) return res.results;  
  if (Array.isArray(res)) return res; 
  if (res.stock) return res.stock;      
  return [];
};














// serch pharmacies
export const searchPharmacies = async (name) => {
  const cacheKey = `pharmacy_search_${name.toLowerCase()}`;
  const online = await isOnline();

  if (!online) {
    return { success: true, results: await loadCache(cacheKey) || [] };
  }

  const res = await fetch(`${BASE_URL}/pharmacy/search?name=${encodeURIComponent(name)}`);
  const data = await res.json();

  if (data.success) saveCache(cacheKey, data.results);

  return data;
};



// Get all pharmacies
export const getAllPharmaciess = async () => {
  const cacheKey = "all_pharmacies";
  const online = await isOnline();

  if (!online) {
    console.log("OFFLINE → Loaded cached pharmacies");
    return { success: true, results: await loadCache(cacheKey) || [] };
  }

  const res = await fetch(`${BASE_URL}/pharmacy/allpharmacies`);
  const data = await res.json();

  if (data.success) saveCache(cacheKey, data.results);

  return data;
};



// Get nearest pharmacies
export const getNearestPharmacies = async (lat, lng) => {
  const cacheKey = `nearest_${lat}_${lng}`;
  const online = await isOnline();

  if (!online) {
    return { success: true, results: await loadCache(cacheKey) || [] };
  }

  const res = await fetch(`${BASE_URL}/pharmacy/nearest?lat=${lat}&lng=${lng}`);
  const data = await res.json();

  if (data.success) saveCache(cacheKey, data.results);

  return data;
};



// combined fetch pharmacies (all, nearest, or search)
export const fetchPharmaciess = async (name = "", location = null) => {
  if (!name) {
    if (location) {
      return await getNearestPharmacies(location.lat, location.lng);
    } else {
      return await getAllPharmacies();
    }
  } else {
    return await searchPharmacies(name);
  }
};




// subscribe to a pharmacy
export async function subscribePharmacy(pharmacyId, userId) {
  try {
    const expoPushToken = await registerForPushNotificationsAsync(); // Get token
    if (!expoPushToken) {
      return { success: false, message: "Failed to get Expo push token" };
    }

    const res = await fetch(`${BASE_URL}/customer/subscribe-pharmacy/${pharmacyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, expoPushToken }), // Send token
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, message: text || `HTTP ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    console.error("subscribePharmacy error:", error);
    return { success: false, message: error.message };
  }
}

export async function unsubscribePharmacy(pharmacyId, userId) {
  try {
    const res = await fetch(`${BASE_URL}/customer/unsubscribe-pharmacy/${pharmacyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, message: text || `HTTP ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    console.error("unsubscribePharmacy error:", error);
    return { success: false, message: error.message };
  }
}






// Get all pharmacies
export const getAllPharmacies = async () => {
  const cacheKey = "all_pharmacies";
  const online = await isOnline();

  if (!online) return await loadCache(cacheKey) || [];

  const res = await fetch(`${BASE_URL}/pharmacy/allpharmacies`);
  const data = await res.json();

  if (data.success) {
    await saveCache(cacheKey, data.results);
    return data.results;
  }
  return [];
};



/**************************************
   FRONTEND NEAREST PHARMACIES (SUPER FAST)
**************************************/
export const getNearestPharmaciesLocal = async (lat, lng, limit = 20) => {
  const pharmacies = await getAllPharmacies(); // cached → instant

  const sorted = pharmacies
  .map(p => {
      if (!p.location?._latitude) return { ...p, distance: Infinity };
      return {
        ...p,
        distance: haversineDistance(lat, lng, p.location._latitude, p.location._longitude)
      };
    })
  .sort((a,b) => a.distance - b.distance)
  .slice(0, limit);

  return sorted;
};


/**************************************
   COMBINED FUNCTION (REPLACES OLD ONE)
**************************************/
export const fetchPharmacies = async (name = "", location = null) => {

  // 1) Search by name ----------------------
  if (name) return searchPharmacies(name);

  // 2) No name → load all / nearest --------
  if (location) {
    return { success:true, results: await getNearestPharmaciesLocal(location.lat, location.lng) };
  }

  // 3) Normal load -------------------------
  const all = await getAllPharmacies();
  return { success:true, results:all };
};

// subscribe medicine

export async function subscribeMedicine(medicine, userId) {
  const expoPushToken = await getExpoPushToken();
  console.log("Expo Push Token:", expoPushToken);

  const res = await fetch(`${BASE_URL}/customer/subscribe-medicine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      medicine,
      userId,
      expoPushToken,
    }),
  });

  return res.json();
}

