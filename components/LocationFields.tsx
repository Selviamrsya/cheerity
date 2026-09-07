"use client";

import React from "react";
import SearchableSelect from "./SearchableSelect";
import {
  INDONESIA_PROVINCES,
  INDONESIA_CITIES_BY_PROVINCE,
} from "@/constants/indonesiaLocations";

interface LocationFieldsProps {
  stateValue: string;
  cityValue: string;
  zipCodeValue?: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  onZipCodeChange?: (zip: string) => void;
  errors?: {
    state?: string;
    city?: string;
    zipCode?: string;
  };
}

const LocationFields: React.FC<LocationFieldsProps> = ({
  stateValue,
  cityValue,
  onStateChange,
  onCityChange,
  onZipCodeChange,
  errors,
}) => {
  // Province options
  const provinceOptions = INDONESIA_PROVINCES.map((prov) => ({
    label: prov,
    value: prov,
  }));

  // City options based on selected province, or all cities if no province selected
  let cityOptionsList: { city: string; zipCode: string }[] = [];
  if (stateValue && INDONESIA_CITIES_BY_PROVINCE[stateValue]) {
    cityOptionsList = INDONESIA_CITIES_BY_PROVINCE[stateValue];
  } else {
    // Flatten all cities if no province chosen
    Object.entries(INDONESIA_CITIES_BY_PROVINCE).forEach(([, cities]) => {
      cities.forEach((c) => {
        if (!cityOptionsList.some((existing) => existing.city === c.city)) {
          cityOptionsList.push({ city: c.city, zipCode: c.zipCode });
        }
      });
    });
  }

  const cityOptions = cityOptionsList.map((c) => ({
    label: c.city,
    value: c.city,
  }));

  const handleProvinceSelect = (prov: string) => {
    onStateChange(prov);
    // If the selected city isn't in this province, reset city
    const available = INDONESIA_CITIES_BY_PROVINCE[prov];
    if (available && available.length > 0) {
      // Auto-select first city in province and auto-fill zip if handler provided
      onCityChange(available[0].city);
      if (onZipCodeChange) onZipCodeChange(available[0].zipCode);
    }
  };

  const handleCitySelect = (city: string) => {
    onCityChange(city);
    // Auto-fill zip code if handler provided
    const found = cityOptionsList.find((c) => c.city === city);
    if (found?.zipCode && onZipCodeChange) {
      onZipCodeChange(found.zipCode);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {/* State / Province */}
      <div className="form-group">
        <label className="form-label">State / Province</label>
        <SearchableSelect
          value={stateValue}
          onChange={handleProvinceSelect}
          options={provinceOptions}
          placeholder="Select State / Province"
          searchPlaceholder="Search province..."
        />
        {errors?.state && <p className="form-error">{errors.state}</p>}
      </div>

      {/* City */}
      <div className="form-group">
        <label className="form-label">City</label>
        <SearchableSelect
          value={cityValue}
          onChange={handleCitySelect}
          options={cityOptions}
          placeholder="Select City"
          searchPlaceholder="Search city..."
        />
        {errors?.city && <p className="form-error">{errors.city}</p>}
      </div>
    </div>
  );
};

export default LocationFields;
