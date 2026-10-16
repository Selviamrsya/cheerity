"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ReverseGeocodeResult } from "@/lib/reverseGeocoding";

// Import CSS only on client side
import "leaflet/dist/leaflet.css";

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: ReverseGeocodeResult) => void;
  height?: string;
}

// Dynamic import for the entire map component to avoid SSR issues
const MapContent = dynamic(
  () => import("./MapPickerContent"),
  { ssr: false }
);

const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
  height = "400px",
}) => {
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        style={{ height }}
        className="w-full bg-gray-100 rounded-sm flex items-center justify-center"
      >
        <p className="text-gray-500 text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full rounded-sm overflow-hidden border border-gray-300">
      <MapContent
        latitude={latitude}
        longitude={longitude}
        onLocationChange={onLocationChange}
        onAddressChange={onAddressChange}
      />
    </div>
  );
};

export default MapPicker;
