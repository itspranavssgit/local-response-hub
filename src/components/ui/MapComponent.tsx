// src/components/MapComponent.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  onLocationChange?: (loc: { lat: number; lng: number }) => void;
  mapHeight?: string;
};

function LocationMarker({ onLocationChange }: Props) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useMapEvents({
    click(e) {
      const newLoc = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newLoc);
      onLocationChange?.(newLoc);
    },
    locationfound(e) {
      setPosition(e.latlng);
      onLocationChange?.(e.latlng);
    },
  });

  return position ? (
    <Marker position={position} icon={defaultIcon}>
      <Popup>Your selected location</Popup>
    </Marker>
  ) : null;
}

export default function MapComponent({ onLocationChange, mapHeight = '300px' }: Props) {
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(coords);
      });
    }
  }, []);

  return (
    <div style={{ height: mapHeight }} className="rounded overflow-hidden shadow-md">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <LocationMarker onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}
