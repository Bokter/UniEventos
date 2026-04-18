import { useEffect, useRef } from "react";
import L from "leaflet";

interface EventMapProps {
  lat: number;
  lng: number;
  locationName: string;
}

export function EventMap({ lat, lng, locationName }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // TODO: Manejar errores de carga de Leaflet y tiles de OpenStreetMap
    try {
      // Initialize map
      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 16,
        scrollWheelZoom: false,
      });

      // Add tile layer - Puede fallar si OpenStreetMap no responde
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add marker
      L.marker([lat, lng]).addTo(map);

      mapInstanceRef.current = map;
    } catch (error) {
      console.error("Error inicializando mapa:", error);
      // TODO: Mostrar mensaje de error al usuario si el mapa falla
    }

    // Cleanup
    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (error) {
        console.error("Error limpiando mapa:", error);
      }
    };
  }, [lat, lng]);

  return (
    <div
      ref={mapRef}
      className="h-64 rounded-lg overflow-hidden border border-gray-200"
    />
  );
}