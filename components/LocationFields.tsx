"use client";

import React from "react";
import SearchableSelect from "./SearchableSelect";
import {
  INDONESIA_PROVINCES,
  INDONESIA_CITIES_BY_PROVINCE,
} from "@/constants/indonesiaLocations";

type CityData = { city: string; zipCode: string };
type OptionData = { label: string; value: string };

interface LocationFieldsProps {
  stateValue: string;
  cityValue: string;
  zipCodeValue?: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  onZipCodeChange?: (zip: string) => void;
  onLocationChange?: (location: { state: string; city: string; zipCode?: string }) => void;
  errors?: {
    state?: string;
    city?: string;
    zipCode?: string;
  };
}

const LocationFields: React.FC<LocationFieldsProps> = ({
  stateValue,
  cityValue,
  zipCodeValue,
  onStateChange,
  onCityChange,
  onZipCodeChange,
  onLocationChange,
  errors,
}) => {
  // Province options
  const provinceOptions: OptionData[] = INDONESIA_PROVINCES.map((prov: string) => ({
    label: prov,
    value: prov,
  }));

  // City options based on selected province, or all cities if no province selected
  let cityOptionsList: CityData[] = [];
  if (stateValue && INDONESIA_CITIES_BY_PROVINCE[stateValue]) {
    cityOptionsList = INDONESIA_CITIES_BY_PROVINCE[stateValue];
  } else {
    // Show all cities if no province chosen (for initial state)
    Object.entries(INDONESIA_CITIES_BY_PROVINCE).forEach(([, cities]: [string, CityData[]]) => {
      cities.forEach((c: CityData) => {
        if (!cityOptionsList.some((existing: CityData) => existing.city === c.city)) {
          cityOptionsList.push({ city: c.city, zipCode: c.zipCode });
        }
      });
    });
  }

  // Check if current city is valid for the selected province
  const isCityValidForProvince = stateValue && cityValue &&
    INDONESIA_CITIES_BY_PROVINCE[stateValue]?.some((c: CityData) => c.city === cityValue);

  const cityOptions: OptionData[] = cityOptionsList.map((c: CityData) => ({
    label: c.city,
    value: c.city,
  }));

  // Add current city value to options if it's not in the list (for display purposes)
  if (cityValue && !cityOptions.some((opt: OptionData) => opt.value === cityValue)) {
    cityOptions.push({ label: cityValue, value: cityValue });
  }

  const handleProvinceSelect = (prov: string) => {
    let newCity = "";
    let newZip = "";

    const available = INDONESIA_CITIES_BY_PROVINCE[prov];
    if (available && available.length > 0) {
      const currentCityValid = available.some((c: CityData) => c.city === cityValue);
      if (currentCityValid) {
        const cityData = available.find((c: CityData) => c.city === cityValue);
        newCity = cityValue;
        newZip = cityData?.zipCode || "";
      } else {
        newCity = available[0].city;
        newZip = available[0].zipCode;
      }
    }

    if (onLocationChange) {
      onLocationChange({ state: prov, city: newCity, zipCode: newZip });
    }

    onStateChange(prov);
    onCityChange(newCity);
    if (onZipCodeChange) onZipCodeChange(newZip);
  };

  const handleCitySelect = (city: string) => {
    let found: CityData | undefined;
    if (stateValue && INDONESIA_CITIES_BY_PROVINCE[stateValue]) {
      found = INDONESIA_CITIES_BY_PROVINCE[stateValue].find((c: CityData) => c.city === city);
    }
    if (!found) {
      Object.values(INDONESIA_CITIES_BY_PROVINCE).forEach((cities: CityData[]) => {
        const cityFound = cities.find((c: CityData) => c.city === city);
        if (cityFound && !found) {
          found = cityFound;
        }
      });
    }

    const newZip = found?.zipCode || "";

    if (onLocationChange) {
      onLocationChange({ state: stateValue, city, zipCode: newZip });
    }

    onCityChange(city);
    if (newZip && onZipCodeChange) {
      onZipCodeChange(newZip);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {/* State / Province */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
        <SearchableSelect
          key={`state-${stateValue}`}
          value={stateValue}
          onChange={handleProvinceSelect}
          options={provinceOptions}
          placeholder="Select State / Province"
          searchPlaceholder="Search province..."
        />
        {errors?.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
        <SearchableSelect
          key={`city-${cityValue}-${stateValue}`}
          value={cityValue}
          onChange={handleCitySelect}
          options={cityOptions}
          placeholder="Select City"
          searchPlaceholder="Search city..."
        />
        {errors?.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
      </div>

      {/* Zip Code */}
      {onZipCodeChange && (
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
          <input
            type="text"
            value={zipCodeValue || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onZipCodeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            placeholder="Zip Code"
            style={{ marginTop: "4px", marginBottom: "8px" }}
          />
          {errors?.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
        </div>
      )}
    </div>
  );
};

export default LocationFields;
