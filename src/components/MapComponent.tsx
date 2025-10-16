import { useEffect, useRef } from "react";

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current) {
      // Center of the map (India)
      const map = new (window as any).L.Map(mapRef.current).setView(
        [20.5937, 78.9629],
        5
      );

      // Add OpenStreetMap tiles
      (window as any).L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Add a marker (for example, Mumbai)
      (window as any).L.marker([19.076, 72.8777]).addTo(map)
        .bindPopup("Emergency Request: Mumbai")
        .openPopup();
    }
  }, []);

  return (
    <div
      ref={mapRef}
      id="map"
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "12px",
        marginTop: "20px",
      }}
    ></div>
  );
};

export default MapComponent;
