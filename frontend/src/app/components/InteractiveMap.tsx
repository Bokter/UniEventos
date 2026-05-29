import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import L from "leaflet";
import type { Event } from "../data/mockData";

interface InteractiveMapProps {
  events: Event[];
  center: [number, number];
}

export function InteractiveMap({ events, center }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
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
    if (!mapRef.current) return;

    // Clean up existing map
    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    } catch (error) {
      console.error("Error limpiando mapa anterior:", error);
    }

    // Solucionar problema de iconos de Leaflet en compilaciones
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
        center: center,
        zoom: 15,
        scrollWheelZoom: true,
      });

      // Add tile layer
      const tileLayer = getIsLight() ? getLightTile() : getDarkTile();
      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;

      // Add markers for each event
      events.forEach((event: any) => {
        try {
          const lat = Number(event.lugar?.latitud || event.lugar?.lat || event.location?.lat);
          const lng = Number(event.lugar?.longitud || event.lugar?.lng || event.location?.lng);

          if (isNaN(lat) || isNaN(lng)) return;

          const marker = L.marker([lat, lng]).addTo(map);

          // Create popup content
          const titulo = event.titulo || event.title;
          const fechaStr = event.fecha || event.dateStart;
          const d = new Date(fechaStr);
          
          const popupContent = `
            <div style="padding:8px;font-family:Manrope,sans-serif;color:var(--text-primary);">
              <h3 style="margin:0 0 4px;font-weight:700;font-size:14px;color:var(--text-primary);">${titulo}</h3>
              <p style="margin:0 0 8px;font-size:12px;color:var(--text-secondary);">
                ${isNaN(d.getTime()) ? "" : format(d, "MMM d, yyyy")}
              </p>
              <a href="/event/${event.id}" style="font-size:12px;color:var(--accent-primary);font-weight:600;text-decoration:none;">
                Ver detalles →
              </a>
            </div>
          `;

          marker.bindPopup(popupContent);
          markersRef.current.push(marker);
        } catch (error) {
          console.error(`Error creando marcador para evento ${event.id}:`, error);
        }
      });

      mapInstanceRef.current = map;
    } catch (error) {
      console.error("Error inicializando mapa interactivo:", error);
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
        markersRef.current = [];
      } catch (error) {
        console.error("Error limpiando mapa interactivo:", error);
      }
    };
  }, [events, center]);

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

  return <div ref={mapRef} className="h-full w-full map-dark-frame" />;
}