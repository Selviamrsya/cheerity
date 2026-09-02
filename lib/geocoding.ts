// Geocoding using Nominatim (OpenStreetMap) - free, no API key needed
// Rate limit: max 1 request/second, requires User-Agent header

export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  country: string = "Indonesia"
): Promise<{ lat: number; lng: number } | null> {
  const fullQuery = `${address}, ${city}, ${state}, ${country}`;

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", fullQuery);
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

    if (!response.ok) return null;

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    // Geocoding is non-critical, silently fail - user still registers, just no distance info
    return null;
  }
}
