"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, X, Check } from "lucide-react";
import {
  INDONESIA_PROVINCES,
  INDONESIA_CITIES_BY_PROVINCE,
} from "@/constants/indonesiaLocations";

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    district?: string;
    county?: string;
    state?: string;
    region?: string;
    province?: string;
    postcode?: string;
    country?: string;
  };
}

interface AddressSearchProps {
  onAddressSelect: (data: {
    fullAddress: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  }) => void;
  onClear?: () => void;
  initialValue?: string;
  disabled?: boolean;
}

// Helper function to match API result with static Indonesian location data
const matchWithIndonesiaData = (
  apiCity: string,
  apiState: string,
  apiZipCode: string
): { city: string; state: string; zipCode: string } => {
  const apiCityLower = apiCity.toLowerCase();
  const apiStateLower = apiState.toLowerCase();

  let matchedProvince = null;
  let matchedCity = "";
  let matchedZipCode = "";

  // First, try to find matching city across all provinces (prioritize exact match)
  for (const [province, cities] of Object.entries(INDONESIA_CITIES_BY_PROVINCE)) {
    for (const cityData of cities) {
      const cityLower = cityData.city.toLowerCase();
      // Prioritize exact match
      if (apiCityLower === cityLower) {
        matchedCity = cityData.city;
        matchedZipCode = cityData.zipCode;
        matchedProvince = province;
        break;
      }
    }
    if (matchedCity) break;
  }

  // If no exact match, try partial matches
  if (!matchedCity) {
    for (const [province, cities] of Object.entries(INDONESIA_CITIES_BY_PROVINCE)) {
      for (const cityData of cities) {
        const cityLower = cityData.city.toLowerCase();
        // Check if API city contains the static city name (e.g., "Jakarta Barat" contains "Jakarta Barat")
        if (apiCityLower.includes(cityLower) && cityLower.length > 5) {
          matchedCity = cityData.city;
          matchedZipCode = cityData.zipCode;
          matchedProvince = province;
          break;
        }
        // Check if static city name contains API city name (e.g., "Jakarta Barat" contains "barat")
        if (cityLower.includes(apiCityLower) && apiCityLower.length > 3) {
          matchedCity = cityData.city;
          matchedZipCode = cityData.zipCode;
          matchedProvince = province;
          break;
        }
      }
      if (matchedCity) break;
    }
  }

  // If still no city match, try to match province from API state
  if (!matchedProvince) {
    for (const province of INDONESIA_PROVINCES) {
      if (
        apiStateLower === province.toLowerCase() ||
        apiStateLower.includes(province.toLowerCase()) ||
        province.toLowerCase().includes(apiStateLower)
      ) {
        matchedProvince = province;
        break;
      }
    }

    // Special handling for Jakarta variations only if no city match yet
    if (!matchedProvince && (apiCityLower.includes("jakarta") || apiStateLower.includes("jakarta"))) {
      matchedProvince = "DKI Jakarta";
    }
  }

  // If we have province but no city yet, try to match city within that province
  if (matchedProvince && !matchedCity && INDONESIA_CITIES_BY_PROVINCE[matchedProvince]) {
    for (const cityData of INDONESIA_CITIES_BY_PROVINCE[matchedProvince]) {
      const cityLower = cityData.city.toLowerCase();
      if (apiCityLower.includes(cityLower) || cityLower.includes(apiCityLower)) {
        matchedCity = cityData.city;
        matchedZipCode = cityData.zipCode;
        break;
      }
    }
  }

  // Use API state if still no match but we have it
  const finalState = matchedProvince || apiState;
  const finalCity = matchedCity || apiCity;
  const finalZipCode = matchedZipCode || apiZipCode;

  return {
    city: finalCity,
    state: finalState,
    zipCode: finalZipCode,
  };
};

const AddressSearch: React.FC<AddressSearchProps> = ({
  onAddressSelect,
  onClear,
  initialValue = "",
  disabled = false,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(initialValue || null);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 3) {
        searchAddresses(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddresses = async (searchQuery: string) => {
    if (disabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", `${searchQuery}, Indonesia`);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "5");

      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "Cheerity/1.0 (cheerity.vercel.app)",
          "Accept-Language": "id,en",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to search addresses");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setResults(data);
        setShowResults(true);
      } else {
        setResults([]);
      }
    } catch (_err) {
      setError("Failed to search addresses. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (result: AddressResult) => {
    const { address, lat, lon, display_name } = result;

    // Extract address components with more fallbacks
    const street = address.road || address.house_number
      ? `${address.house_number ? address.house_number + " " : ""}${address.road || ""}`.trim()
      : "";

    // Get initial values from API
    const apiCity = address.city || address.town || address.village || address.suburb || address.district || address.county || "";
    const apiState = address.state || address.region || address.province || "";
    const apiZipCode = address.postcode || "";

    // Match with static Indonesian data for better accuracy
    const { city, state } = matchWithIndonesiaData(apiCity, apiState, apiZipCode);

    // Only show error if absolutely no location info
    if (!city && !state) {
      setError("Selected address doesn't have enough location information. Please try a more specific search or add location details manually.");
      return;
    }

    setSelectedAddress(display_name);
    setQuery(display_name);
    setShowResults(false);
    setError(null);

    onAddressSelect({
      fullAddress: display_name,
      street,
      city,
      state,
      zipCode: apiZipCode,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    });
  };

  const handleClear = () => {
    setQuery("");
    setSelectedAddress(null);
    setResults([]);
    setShowResults(false);
    setError(null);
    onClear?.();
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedAddress(null);
          }}
          onFocus={() => query.length > 3 && setShowResults(true)}
          placeholder="Search address (e.g., Jl. Sudirman, Jakarta)"
          disabled={disabled}
          className={`w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-75" : ""
            } ${error ? "!border-red-500" : ""}`}
          style={{ paddingRight: '40px' }}
        />

        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}

        {selectedAddress && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-64 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-900 font-medium line-clamp-2">
                    {result.display_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {result.address.city || result.address.town || result.address.village}, {result.address.state}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isLoading && query.length > 3 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-sm shadow-sm py-5 px-4 text-sm text-gray-500 text-center leading-relaxed" style={{ padding: "4px 0" }}>
          No addresses found. Try a different search term.
        </div>
      )}
    </div>
  );
};

export default AddressSearch;