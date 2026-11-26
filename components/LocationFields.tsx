"use client";

import React, { useEffect, useState } from "react";
import SearchableSelect from "./SearchableSelect";
import { fetchProvinces, fetchRegencies, Province, Regency } from "@/lib/wilayah";

type OptionData = { label: string; value: string };

interface LocationFieldsProps {
  stateValue: string;
  cityValue: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  onLocationChange?: (location: { state: string; city: string }) => void;
  errors?: {
    state?: string;
    city?: string;
  };
  readOnly?: boolean;
  required?: {
    state?: boolean;
    city?: boolean;
  };
}

const LocationFields: React.FC<LocationFieldsProps> = ({
  stateValue,
  cityValue,
  onStateChange,
  onCityChange,
  onLocationChange,
  errors,
  readOnly = false,
  required,
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [regenciesLoading, setRegenciesLoading] = useState(false);

  // Load provinces once
  useEffect(() => {
    let cancelled = false;
    fetchProvinces()
      .then((data) => {
        if (!cancelled) setProvinces(data);
      })
      .catch((err) => {
        console.error("Failed to load provinces:", err);
      })
      .finally(() => {
        if (!cancelled) setProvincesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load regencies (kota/kabupaten) whenever the selected province changes
  useEffect(() => {
    const province = provinces.find((p) => p.name === stateValue);
    if (!province) {
      setRegencies([]);
      return;
    }

    let cancelled = false;
    setRegenciesLoading(true);
    fetchRegencies(province.id)
      .then((data) => {
        if (!cancelled) setRegencies(data);
      })
      .catch((err) => {
        console.error("Failed to load regencies:", err);
        if (!cancelled) setRegencies([]);
      })
      .finally(() => {
        if (!cancelled) setRegenciesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stateValue, provinces]);

  const provinceOptions: OptionData[] = provinces.map((p) => ({
    label: p.name,
    value: p.name,
  }));

  const cityOptions: OptionData[] = regencies.map((r) => ({
    label: r.name,
    value: r.name,
  }));

  // Add current values to options if they're not in the list (e.g. legacy data)
  // so they still display correctly in the dropdown.
  if (stateValue && !provinceOptions.some((opt) => opt.value === stateValue)) {
    provinceOptions.unshift({ label: stateValue, value: stateValue });
  }
  if (cityValue && !cityOptions.some((opt) => opt.value === cityValue)) {
    cityOptions.unshift({ label: cityValue, value: cityValue });
  }

  const handleProvinceSelect = (prov: string) => {
    // Clear the city when the province changes since it may no longer be valid.
    if (onLocationChange) {
      onLocationChange({ state: prov, city: "" });
    }
    onStateChange(prov);
    onCityChange("");
  };

  const handleCitySelect = (city: string) => {
    if (onLocationChange) {
      onLocationChange({ state: stateValue, city });
    }
    onCityChange(city);
  };

  const readOnlyInputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-600 text-sm cursor-not-allowed select-none";

  const loadingClass =
    "w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-50 text-gray-400 text-sm";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {/* State / Province */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">State / Province{required?.state && <span className="text-red-500"> *</span>}</label>
        {readOnly && stateValue ? (
          <input
            type="text"
            value={stateValue}
            readOnly
            tabIndex={-1}
            className={readOnlyInputClass}
            style={{ marginTop: "4px", marginBottom: "8px", minHeight: "38px" }}
          />
        ) : provincesLoading ? (
          <input
            type="text"
            value="Loading provinces..."
            readOnly
            tabIndex={-1}
            className={loadingClass}
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

      {/* City / Regency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City / Regency{required?.city && <span className="text-red-500"> *</span>}</label>
        {readOnly && cityValue ? (
          <input
            type="text"
            value={cityValue}
            readOnly
            tabIndex={-1}
            className={readOnlyInputClass}
            style={{ marginTop: "4px", marginBottom: "8px", minHeight: "38px" }}
          />
        ) : !stateValue ? (
          <input
            type="text"
            value="Select a province first"
            readOnly
            tabIndex={-1}
            className={loadingClass}
            style={{ marginTop: "4px", marginBottom: "8px", minHeight: "38px" }}
          />
        ) : regenciesLoading || (stateValue && provincesLoading) ? (
          <input
            type="text"
            value="Loading cities..."
            readOnly
            tabIndex={-1}
            className={loadingClass}
            style={{ marginTop: "4px", marginBottom: "8px", minHeight: "38px" }}
          />
        ) : (
          <SearchableSelect
            key={`city-${cityValue}-${stateValue}`}
            value={cityValue}
            onChange={handleCitySelect}
            options={cityOptions}
            placeholder="Select City / Regency"
            searchPlaceholder="Search city..."
          />
        )}
        {errors?.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
      </div>
    </div>
  );
};

export default LocationFields;
