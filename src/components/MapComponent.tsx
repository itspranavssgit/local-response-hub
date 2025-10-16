import React, { useEffect, useRef } from "react";

interface MapProps {
  onLocationChange?: (location: { lat: number; lng: number }) => void;
  mapHeight?: string;
}

const MapComponent: React.FC<MapProps> = ({ onLocationChange, mapHeight = "300px" }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the OpenStreetMap map (no API key required)
    const L = (window as any).L;
    if (!L) {
      const leafletScript = document.createElement("script");
      leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      leafletScript.integrity =
        "sha256-o9N1j7kJ7c5foBq0D7GZ7TGi0LxkLxjvP6f3T5R1jtk=";
      leafletScript.crossOrigin = "";
      leafletScript.onload = initMap;
      document.body.appendChild(leafletScript);

      const leafletCSS = document.createElement("link");
      leafletCSS.rel = "stylesheet";
      leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      leafletCSS.integrity =
        "sha256-sA+e2k27CkQoKxTqU2aKqIFNKjVqzv8T9DOfv1pP3u4=";
      leafletCSS.crossOrigin = "";
      document.head.appendChild(leafletCSS);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapRef.current) return;

      const L = (window as any).L;
      const defaultLat = 20.5937; // India center lat
      const defaultLng = 78.9629; // India center lng
      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      let marker: any = null;

      // If geolocation is available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            map.setView([lat, lng], 13);
            marker = L.marker([lat, lng]).addTo(map);
            if (onLocationChange) onLocationChange({ lat, lng });
          },
          () => {
            console.warn("Could not get location");
          }
        );
      }

      // Allow manual marker placement
      map.on("click", function (e: any) {
        if (marker) map.removeLayer(marker);
        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        if (onLocationChange) onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }
  }, [onLocationChange]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: mapHeight,
        borderRadius: "12px",
        border: "2px solid #ccc",
        overflow: "hidden",
      }}
    />
  );
};

export default MapComponent;
