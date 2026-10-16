"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { reverseGeocode, ReverseGeocodeResult } from "@/lib/reverseGeocoding";

// Custom marker icon (red marker)
const createCustomIcon = () => {
  if (typeof window !== "undefined") {
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: #ef4444;
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });
  }
  return undefined;
};

interface MapPickerContentProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: ReverseGeocodeResult) => void;
}

const MapController = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo([latitude, longitude], 15, {
      duration: 1.5,
    });
  }, [map, latitude, longitude]);

  return null;
};

const HandleMarkerDrag = ({
  position,
  onLocationChange,
  onAddressChange,
}: {
  position: [number, number];
  onLocationChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: ReverseGeocodeResult) => void;
}) => {
  const customIcon = createCustomIcon();

  return (
    <Marker
      position={position}
      draggable={true}
      icon={customIcon}
      eventHandlers={{
        dragend: async (e) => {
          const marker = e.target;
          const newPosition = marker.getLatLng();
          onLocationChange(newPosition.lat, newPosition.lng);

          // Perform reverse geocoding to get address components
          if (onAddressChange) {
            const addressData = await reverseGeocode(newPosition.lat, newPosition.lng);
            if (addressData.success) {
              onAddressChange(addressData);
            }
          }
        },
      }}
    />
  );
};

const MapPickerContent: React.FC<MapPickerContentProps> = ({
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
}) => {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);
  const [mapKey, setMapKey] = useState(0);

  // Update position when props change
  useEffect(() => {
    setPosition([latitude, longitude]);
    setMapKey((prev) => prev + 1); // Force re-render to fly to new position
  }, [latitude, longitude]);

  return (
    <MapContainer
      key={mapKey}
      center={[latitude, longitude]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController latitude={latitude} longitude={longitude} />
      <HandleMarkerDrag position={position} onLocationChange={onLocationChange} onAddressChange={onAddressChange} />
    </MapContainer>
  );
};

export default MapPickerContent;
