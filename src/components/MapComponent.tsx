// src/components/MapComponent.tsx
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  onLocationChange?: (coords: { lat: number; lng: number }) => void;
  mapHeight?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ onLocationChange, mapHeight = "400px" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      // Initialize map centered on India
      const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
      leafletMapRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Add a sample marker (Mumbai)
      const marker = L.marker([19.076, 72.8777]).addTo(map);
      marker.bindPopup("Example: Mumbai").openPopup();

      // Optional — detect user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            L.marker(coords).addTo(map).bindPopup("You are here").openPopup();
            map.setView(coords, 13);
            onLocationChange?.(coords);
          },
          () => {
            console.warn("Could not fetch location");
          }
        );
      }
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [onLocationChange]);

  return (
    <div
      ref={mapRef}
      id="map"
      style={{
        height: mapHeight,
        width: "100%",
        borderRadius: "12px",
        marginTop: "20px",
        overflow: "hidden",
      }}
    />
  );
};

export default MapComponent;
