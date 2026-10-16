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
  readOnly?: boolean;
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
  readOnly = false,
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
  // Also add it to the beginning so it's easily accessible
  if (cityValue && !cityOptions.some((opt: OptionData) => opt.value === cityValue)) {
    cityOptions.unshift({ label: cityValue, value: cityValue });
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
      }
      // Removed auto-select of first city - let user choose
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

    // Auto-set zip code if found, otherwise keep current value
    const newZipCode = found?.zipCode || zipCodeValue || "";

    if (onLocationChange) {
      onLocationChange({ state: stateValue, city, zipCode: newZipCode });
    }

    onCityChange(city);
    if (onZipCodeChange) onZipCodeChange(newZipCode);
  };

  const getZipCodeOptions = (): OptionData[] => {
    const zipCodes = new Set<string>();
    
    // Get zip codes for the selected province and city
    if (stateValue && cityValue && INDONESIA_CITIES_BY_PROVINCE[stateValue]) {
      const cities = INDONESIA_CITIES_BY_PROVINCE[stateValue];
      cities.forEach((c: CityData) => {
        if (c.city === cityValue && c.zipCode) {
          zipCodes.add(c.zipCode);
        }
      });
    }
    
    // If no specific zip codes found, show all zip codes from the selected province
    if (zipCodes.size === 0 && stateValue && INDONESIA_CITIES_BY_PROVINCE[stateValue]) {
      const cities = INDONESIA_CITIES_BY_PROVINCE[stateValue];
      cities.forEach((c: CityData) => {
        if (c.zipCode) {
          zipCodes.add(c.zipCode);
        }
      });
    }
    
    // If still no zip codes, show all available zip codes
    if (zipCodes.size === 0) {
      Object.values(INDONESIA_CITIES_BY_PROVINCE).forEach((cities: CityData[]) => {
        cities.forEach((c: CityData) => {
          if (c.zipCode) {
            zipCodes.add(c.zipCode);
          }
        });
      });
    }
    
    const options: OptionData[] = Array.from(zipCodes).map(zip => ({
      label: zip,
      value: zip,
    }));

    // Add current zip code value if it's not in the list (for display purposes)
    // Also add it to the beginning so it's easily accessible
    if (zipCodeValue && !options.some((opt: OptionData) => opt.value === zipCodeValue)) {
      options.unshift({ label: zipCodeValue, value: zipCodeValue });
    }

    return options;
  };

  const readOnlyInputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-600 text-sm cursor-not-allowed select-none";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {/* State / Province */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
        {readOnly && stateValue ? (
          <input
            type="text"
            value={stateValue}
            readOnly
            tabIndex={-1}
            className={readOnlyInputClass}
            style={{ marginTop: "4px", marginBottom: "8px", minHeight: "38px" }}
          />
        ) : (
          <SearchableSelect
            key={`state-${stateValue}`}
            value={stateValue}
            onChange={handleProvinceSelect}
            options={provinceOptions}
            placeholder="Select State / Province"
            searchPlaceholder="Search province..."
          />
        )}
        {errors?.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
        {readOnly && cityValue ? (
          <input
            type="text"
            value={cityValue}
            readOnly
            tabIndex={-1}
            className={readOnlyInputClass}
            style={{ marginTop: "4px", marginBottom: "8px", minHeight: "38px" }}
          />
        ) : (
          <SearchableSelect
            key={`city-${cityValue}-${stateValue}`}
            value={cityValue}
            onChange={handleCitySelect}
            options={cityOptions}
            placeholder="Select City"
            searchPlaceholder="Search city..."
          />
        )}
        {errors?.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
      </div>

      {/* Zip Code */}
      {onZipCodeChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
          {readOnly && zipCodeValue ? (
            <input
              type="text"
              value={zipCodeValue || ""}
              readOnly
              tabIndex={-1}
              className={readOnlyInputClass}
              style={{ marginTop: "4px", marginBottom: "8px", minHeight: "38px" }}
            />
          ) : (
            <SearchableSelect
              key={`zip-${zipCodeValue}-${cityValue}`}
              value={zipCodeValue || ""}
              onChange={(zip) => onZipCodeChange(zip)}
              options={getZipCodeOptions()}
              placeholder="Select Zip Code"
              searchPlaceholder="Search zip code..."
            />
          )}
          {errors?.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
        </div>
      )}
    </div>
  );
};

export default LocationFields;
