const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_KEY;

export async function getRealWalkingDistance(from, to) {
  try {
    const res = await fetch(
      "https://api.openrouteservice.org/v2/directions/foot-walking",
      {
        method: "POST",
        headers: {
          "Authorization": ORS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [from.lng, from.lat],
            [to.lng, to.lat],
          ],
        }),
      }
    );

    const data = await res.json();

    if (!data.routes?.length) return Infinity;

    return data.routes[0].summary.distance / 1000; // km
  } catch (err) {
    console.warn("Walking routing error:", err);
    return Infinity;
  }
}
