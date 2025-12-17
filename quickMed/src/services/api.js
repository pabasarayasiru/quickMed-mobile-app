import { haversineDistance } from "../utils/distance";
import { registerForPushNotificationsAsync, getExpoPushToken } from "./notifications";
import { saveCache, loadCache, isOnline } from "./offlineCache";
import { getRealWalkingDistance } from "../utils/realRouteDistance";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL; 



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
  const cacheKey = `pharmacy_${pharmacyId}`;
    const online = await isOnline();

    if (!online) {
      // try per-pharmacy cache first and normalize
      const cached = await loadCache(cacheKey);
      if (cached) {
        if (cached.success && (cached.name || cached.id)) return cached;
        if (Array.isArray(cached)) {
          const found = cached.find((p) => (p._id || p.id) === pharmacyId);
          if (found) return { success: true, ...found };
        }
        if (cached.results && Array.isArray(cached.results)) {
          const found = cached.results.find((p) => (p._id || p.id) === pharmacyId);
          if (found) return { success: true, ...found };
        }
        if (typeof cached === "object") return { success: true, ...cached };
      }

      // fallback to all_pharmacies list
      const all = await loadCache("all_pharmacies") || [];
      const list = Array.isArray(all) ? all : (all.results || []);
      const found = list.find((p) => (p._id || p.id) === pharmacyId);
      if (found) return { success: true, ...found };

      return { success: false, error: "Pharmacy not found (offline)" };
    }

    const res = await fetch(`${BASE_URL}/pharmacy/${pharmacyId}`);
    const data = await res.json();

    // cache per-pharmacy result for offline use (store normalized object)
    try {
      if (data && data.success) {
        const normalized = { success: true, id: data.id || data._id || pharmacyId, name: data.name || data.displayName || "" , ...data };
        await saveCache(cacheKey, normalized);

        // also update all_pharmacies cache if present
        const allCached = await loadCache("all_pharmacies");
        if (allCached) {
          const arr = Array.isArray(allCached) ? allCached : (allCached.results || []);
          const idx = arr.findIndex((p) => (p._id || p.id) === pharmacyId || (p.id === data.id));
          const entry = { id: normalized.id, name: normalized.name, ...data };
          if (idx >= 0) arr[idx] = entry; else arr.unshift(entry);
          await saveCache("all_pharmacies", arr);
        }
      }
    } catch (err) {
    }

    return data;
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
  const cacheKey = `stock_${pharmacyId}`;

  const res = await fetch(`${BASE_URL}/pharmacy/stock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pharmacyId, medicine, quantity }),
  });

  const data = await res.json();

  if (data && data.success) {
    try {
      const cached = await loadCache(cacheKey) || [];
      const created = data.result || data.item || null;
      if (created) {
        await saveCache(cacheKey, [created, ...cached]);
      } else {
        const latest = await getStock(pharmacyId);
        await saveCache(cacheKey, latest.results || latest || []);
      }
    } catch (err) {
    }
  }

  return data;
};




// Update existing stock
export const updateStock = async (pharmacyId, medicine, quantity) => {
  const cacheKey = `stock_${pharmacyId}`;

  const res = await fetch(`${BASE_URL}/pharmacy/stock/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pharmacyId, medicine, quantity }),
  });

  const data = await res.json();

  if (data && data.success) {
    try {
      const cached = await loadCache(cacheKey) || [];
      const updatedItem = data.result || data.item || null;
      if (updatedItem) {
        const updated = cached.map((s) => {
          const id = s._id || s.id;
          const uid = updatedItem._id || updatedItem.id;
          return id === uid ? updatedItem : s;
        });
        await saveCache(cacheKey, updated);
      } else {
        const latest = await getStock(pharmacyId);
        await saveCache(cacheKey, latest.results || latest || []);
      }
    } catch (err) {
    }
  }

  return data;
};



// Get a specific stock item by medicineId
export const getStockById = async (pharmacyId, medicineId) => {
  const cacheKey = `stock_${pharmacyId}`;
  const online = await isOnline();

  if (!online) {
    const cached = await loadCache(cacheKey) || [];
    return cached.find((s) => s._id === medicineId || s.id === medicineId) || null;
  }

  const res = await fetch(`${BASE_URL}/pharmacy/${pharmacyId}/stock/${medicineId}`);
  return res.json();
};




// Delete a stock item
export const deleteStock = async (pharmacyId, medicineId) => {
  const cacheKey = `stock_${pharmacyId}`;

  const res = await fetch(`${BASE_URL}/pharmacy/${pharmacyId}/stock/${medicineId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();

  if (data && data.success) {
    try {
      const cached = await loadCache(cacheKey) || [];
      const updated = cached.filter((s) => (s._id || s.id) !== medicineId);
      await saveCache(cacheKey, updated);
    } catch (err) {
    }
  }

  return data;
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
  const cacheKey = `stock_${pharmacyId}`;
  const online = await isOnline();

  if (!online) {
    return await loadCache(cacheKey) || [];
  }

  const res = await fetch(`${BASE_URL}/pharmacy/${pharmacyId}/stock`);
  const data = await res.json();

  if (data && data.success) {
    await saveCache(cacheKey, data.results || data.stock || []);
  }

  return data;
};



// Search stock by medicine name
export const searchStock = async (pharmacyId, name) => {
  const clean = name.trim();
  const cacheKey = `stock_search_${pharmacyId}_${clean.toLowerCase()}`;
  const online = await isOnline();

  if (!online) {
    return { success: true, results: await loadCache(cacheKey) || [] };
  }

  const res = await fetch(`${BASE_URL}/pharmacy/${pharmacyId}/stock/search?name=${encodeURIComponent(clean)}`);
  const data = await res.json();

  if (data && data.success) {
    await saveCache(cacheKey, data.results || []);
  }

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




// export const getNearestPharmaciesLocal = async (lat, lng, limit = 20) => {
//   const pharmacies = await getAllPharmacies(); // cached → instant

//   const sorted = pharmacies
//   .map(p => {
//       if (!p.location?._latitude) return { ...p, distance: Infinity };
//       return {
//         ...p,
//         distance: haversineDistance(lat, lng, p.location._latitude, p.location._longitude)
//       };
//     })
//   .sort((a,b) => a.distance - b.distance)
//   .slice(0, limit);

//   return sorted;
// };



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







//COMBINED FUNCTION 
export const fetchPharmacies = async (name = "", location = null) => {

  // Search by name 
  if (name) return searchPharmacies(name);

  // 2) No name → load all / nearest 

  // if (location) {
  //   return { success:true, results: await getNearestPharmaciesLocal(location.lat, location.lng) };
  // }

  

  if (location) {
    return {
      success: true,
      results: await getNearestPharmaciesReal(
        location.lat,
        location.lng
      )
    };
  }


  // Normal load 
  const all = await getAllPharmacies();
  return { success:true, results:all };
};






// Get nearest pharmacies with real walking distances


export const getNearestPharmaciesReal = async (userLat, userLng, limit = 10) => {
  const pharmacies = await getAllPharmacies();

  // cache key uses rounded coords to improve reuse
  const cacheKey = `nearest_real_${Math.round(userLat * 1000)}_${Math.round(
    userLng * 1000
  )}_${limit}`;

  // Quick online check
  const online = await isOnline();

  // 1) If offline try to return previously cached real results
  if (!online) {
    const cached = await loadCache(cacheKey);
    if (cached && Array.isArray(cached) && cached.length) {
      return cached.slice(0, limit);
    }
    // Fallback to approximate distances
    const approx = pharmacies
      .map((p) => {
        if (!p.location?._latitude) return null;
        return {
          ...p,
          distance: haversineDistance(
            userLat,
            userLng,
            p.location._latitude,
            p.location._longitude
          ),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return approx;
  }

  // 2) Online: compute real walking distances for a short candidate list
  const candidates = pharmacies
    .map((p) => {
      if (!p.location?._latitude) return null;
      return {
        ...p,
        approxDistance: haversineDistance(
          userLat,
          userLng,
          p.location._latitude,
          p.location._longitude
        ),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.approxDistance - b.approxDistance)
    .slice(0, 15); // small batch

  const routed = await Promise.all(
    candidates.map(async (p) => {
      try {
        const distance = await getRealWalkingDistance(
          { lat: userLat, lng: userLng },
          { lat: p.location._latitude, lng: p.location._longitude }
        );

        return { ...p, distance };
      } catch (err) {
        console.warn("Routing error for pharmacy:", p.name, err);
        return { ...p, distance: Infinity };
      }
    })
  );

  // Sort and cache the final result for offline reuse
  const sorted = routed.sort((a, b) => a.distance - b.distance).slice(0, limit);
  try {
    await saveCache(cacheKey, sorted);
  } catch (err) {
    // ignore cache errors
  }

  return sorted;
};



