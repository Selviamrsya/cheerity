// Geocoding using Nominatim (OpenStreetMap) - free, no API key needed
// Rate limit: max 1 request/second, requires User-Agent header

export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  country: string = "Indonesia"
): Promise<{ lat: number; lng: number } | null> {
  // Build query - try multiple strategies
  const queries = [];

  // Strategy 1: Full address if provided
  if (address && address.trim().length > 3) {
    queries.push(`${address}, ${city}, ${state}, ${country}`);
  }

  // Strategy 2: City + state only (more reliable)
  queries.push(`${city}, ${state}, ${country}`);

  // Strategy 3: Just city + country (fallback)
  queries.push(`${city}, ${country}`);

  console.log("Geocoding queries to try:", queries);

  for (const query of queries) {
    try {
      console.log("Trying geocoding query:", query);

      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", query);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");

      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "Cheerity/1.0 (cheerity.vercel.app)",
          "Accept-Language": "id,en",
        },
        // Don't cache geocoding results to keep data fresh
        cache: "no-store",
      });

      console.log("Geocoding response status:", response.status);

      if (!response.ok) {
        console.error("Geocoding failed with status:", response.status);
        continue; // Try next query
      }

      const data = await response.json();
      console.log("Geocoding response data:", data);

      if (!Array.isArray(data) || data.length === 0) {
        console.log("Geocoding returned empty array for query:", query);
        continue; // Try next query
      }

      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      console.log("Geocoding successful:", result);
      return result;
    } catch (error) {
      console.error("Geocoding error for query:", query, error);
      continue; // Try next query
    }
  }

  console.log("All geocoding attempts failed");
  return null;
}
