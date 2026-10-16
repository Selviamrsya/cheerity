/**
 * Reverse Geocoding Utility
 * Converts latitude/longitude to address components (province, city, zip code)
 * Uses OpenStreetMap Nominatim API
 */

export interface ReverseGeocodeResult {
  state: string;
  city: string;
  zipCode: string;
  fullAddress: string;
  success: boolean;
}

/**
 * Perform reverse geocoding using OpenStreetMap Nominatim API
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Address components (state, city, zip code, full address)
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          // Required by Nominatim: must include app identity
          'User-Agent': 'Cheerity App (contact: cheerity@example.com)',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.error) {
      throw new Error(data?.error || 'No address found for this location');
    }

    const address = data.address || {};

    // Extract address components for Indonesia
    let state = '';
    let city = '';
    let zipCode = '';

    // State/Province - try multiple common keys
    state =
      address.state ||
      address.province ||
      address.region ||
      address.county ||
      '';

    // City - try multiple common keys
    city =
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      address.district ||
      address.municipality ||
      '';

    // Zip code
    zipCode = address.postcode || '';

    // For Indonesia, sometimes state is in "county" or "region"
    if (!state && address.county) {
      state = address.county;
    }

    // Clean up city name (remove common prefixes/suffixes)
    city = city
      .replace(/^(Kota|Kabupaten)\s+/i, '')
      .replace(/\s+(Kota|Kabupaten)$/i, '')
      .trim();

    return {
      state,
      city,
      zipCode,
      fullAddress: data.display_name || '',
      success: true,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      state: '',
      city: '',
      zipCode: '',
      fullAddress: '',
      success: false,
    };
  }
}
