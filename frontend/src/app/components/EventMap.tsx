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
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const getIsLight = () => document.documentElement.classList.contains('light');

  const getDarkTile = () => L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19
    }
  );

  const getLightTile = () => L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Solucionar problema de iconos de Leaflet en compilaciones (Vite/Webpack)
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // TODO: Manejar errores de carga de Leaflet y tiles de OpenStreetMap
    try {
      // Initialize map
      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 16,
        scrollWheelZoom: false,
      });

      // Add tile layer
      const tileLayer = getIsLight() ? getLightTile() : getDarkTile();
      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;

      // Add marker con popup opcional
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(locationName || "Ubicación del evento")
        .openPopup();

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
          tileLayerRef.current = null;
        }
      } catch (error) {
        console.error("Error limpiando mapa:", error);
      }
    };
  }, [lat, lng]);

  // Swap tile layers when theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      if (!mapInstanceRef.current) return;
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const newTile = getIsLight() ? getLightTile() : getDarkTile();
      newTile.addTo(mapInstanceRef.current);
      tileLayerRef.current = newTile;
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  return (
    <div
      ref={mapRef}
      className="h-64 map-dark-frame z-0 relative"
    />
  );
}