// src/components/MapComponent.tsx
import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../../integrations/supabase/client'; // adjust relative path if needed

type Props = {
  initial?: { lat: number; lng: number } | null;
  onLocationChange?: (loc: { lat: number; lng: number }) => void;
  mapHeight?: string;
};

const containerStyle = {
  width: '100%',
  height: '100%',
};

export default function MapComponent({ initial = null, onLocationChange, mapHeight = '300px' }: Props) {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(initial);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(initial);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (!initial && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCenter(coords);
          setMarker(coords);
          onLocationChange?.(coords);
        },
        (err) => {
          console.error('Geolocation error:', err);
          // fallback to a default center (country center)
          const fallback = { lat: 20.5937, lng: 78.9629 }; // India center
          setCenter(fallback);
        },
        { timeout: 8000 }
      );
    } else if (initial) {
      setCenter(initial);
      setMarker(initial);
    }
  }, [initial, onLocationChange]);

  if (loadError) return <div>Map failed to load</div>;
  if (!isLoaded) return <div>Loading map…</div>;

  return (
    <div style={{ height: mapHeight }} className="rounded overflow-hidden shadow-sm">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center ?? { lat: 20.5937, lng: 78.9629 }}
        zoom={center ? 14 : 5}
      >
        {marker && (
          <Marker
            position={marker}
            draggable
            onDragEnd={(e) => {
              const newLoc = { lat: e.latLng?.lat() ?? marker.lat, lng: e.latLng?.lng() ?? marker.lng };
              setMarker(newLoc);
              onLocationChange?.(newLoc);
            }}
            onClick={() => {
              // clicking resets center to marker
              setCenter(marker);
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
