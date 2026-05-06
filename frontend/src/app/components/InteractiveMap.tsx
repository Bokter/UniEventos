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

    // Clean up existing markers
    markersRef.current = [];

    // TODO: Manejar errores de carga de Leaflet y tiles de OpenStreetMap
    try {
      // Initialize map
      const map = L.map(mapRef.current, {
        center: center,
        zoom: 15,
        scrollWheelZoom: true,
      });

      // Add tile layer - Puede fallar si OpenStreetMap no responde
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add markers for each event
      events.forEach((event) => {
        try {
          const marker = L.marker([event.location.lat, event.location.lng]).addTo(
            map
          );

          // Create popup content
          const popupContent = `
            <div class="p-2">
              <h3 class="mb-1 font-semibold">${event.title}</h3>
              <p class="text-sm text-muted-foreground mb-2">
                ${format(event.dateStart, "MMM d, yyyy • h:mm a")}
              </p>
              <a href="/event/${event.id}" class="text-sm text-accent hover:underline">
                See details →
              </a>
            </div>
          `;

          marker.bindPopup(popupContent);
          markersRef.current.push(marker);
        } catch (error) {
          console.error(`Error creando marcador para evento ${event.id}:`, error);
          // Continuar con el siguiente evento
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
        }
        markersRef.current = [];
      } catch (error) {
        console.error("Error limpiando mapa interactivo:", error);
      }
    };
  }, [events, center]);

  return <div ref={mapRef} className="h-full w-full" />;
}