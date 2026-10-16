/**
 * OSRM (Open Source Routing Machine) distance calculation helper
 * Fetches driving distance from public OSRM server with rate limiting
 */

export interface OSDestination {
  lat: number;
  lng: number;
  id: string;
}

export interface OSRMResult {
  id: string;
  drivingDistanceKm: number | null;
}

const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving";
const BATCH_DELAY_MS = 200; // Delay between batch requests to respect rate limits
const REQUEST_TIMEOUT_MS = 5000; // Timeout for individual requests

/**
 * Fetch driving distance from user location to a single destination
 */
export async function fetchSingleRoute(
  userLat: number,
  userLng: number,
  destLat: number,
  destLng: number
): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const url = `${OSRM_BASE_URL}/${userLng},${userLat};${destLng},${destLat}?overview=false`;
    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`OSRM request failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      console.warn("OSRM returned no routes");
      return null;
    }

    // Distance is in meters, convert to km
    const distanceMeters = data.routes[0].distance;
    return distanceMeters / 1000;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("OSRM request timeout");
    } else {
      console.warn("OSRM fetch error:", error);
    }
    return null;
  }
}

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch driving distances to multiple destinations with rate limiting
 * Uses sequential requests with delay to respect OSRM public server rate limits
 */
export async function fetchOSRMDistances(
  userLat: number,
  userLng: number,
  destinations: OSDestination[]
): Promise<OSRMResult[]> {
  if (destinations.length === 0) {
    return [];
  }

  const results: OSRMResult[] = [];

  for (let i = 0; i < destinations.length; i++) {
    const dest = destinations[i];

    const drivingDistanceKm = await fetchSingleRoute(
      userLat,
      userLng,
      dest.lat,
      dest.lng
    );

    results.push({
      id: dest.id,
      drivingDistanceKm,
    });

    // Add delay between requests to respect rate limits
    // Don't delay after the last request
    if (i < destinations.length - 1) {
      await delay(BATCH_DELAY_MS);
    }
  }

  return results;
}
