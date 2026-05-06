import { useState, useEffect } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { X } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { CategoryBadge } from "../components/CategoryBadge";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { InteractiveMap } from "../components/InteractiveMap";
import { eventosApi } from "../services/api.service";
import { toast } from "sonner";

export function MapViewPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await eventosApi.getAll();
        setEvents(data as any[]);
      } catch (error) {
        console.error("Error fetching events for map:", error);
        toast.error("Error al cargar eventos para el mapa");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // eventos filtrados
  const filteredEvents = events.filter(event => {
    const categoria = event.categoria || event.category || "";
    const matchesCategory = selectedCategory === "all" || categoria === selectedCategory;

    const fechaInicioStr = event.fecha_inicio || event.dateStart;
    if (!fechaInicioStr) return matchesCategory;

    const now = new Date();
    const eventDate = new Date(fechaInicioStr);
    
    const matchesDate = dateFilter === "all" ||
      (dateFilter === "today" && format(eventDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) ||
      (dateFilter === "week" && eventDate >= now && eventDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "month" && eventDate >= now && eventDate <= new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()));

    return matchesCategory && matchesDate;
  });

  // centro de los marcadores
  const getCoords = (e: any): [number, number] => {
    if (e.lugar) return [e.lugar.lat, e.lugar.lng];
    if (e.location) return [e.location.lat, e.location.lng];
    return [0, 0];
  };

  const validEvents = filteredEvents.filter(e => {
    const coords = getCoords(e);
    return coords[0] !== 0 || coords[1] !== 0;
  });

  const center: [number, number] = validEvents.length > 0
    ? [
        validEvents.reduce((sum, e) => sum + getCoords(e)[0], 0) / validEvents.length,
        validEvents.reduce((sum, e) => sum + getCoords(e)[1], 0) / validEvents.length
      ]
    : [10.9878, -74.8109]; // Coordenadas por defecto (ej. Barranquilla/Uninorte)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar showSearch={false} />

      <div className="flex-1 flex">
        {/* barra lateral de filtros */}
        <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontWeight: 600 }}>Filtros</h2>
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Cerrar Mapa
                </Button>
              </Link>
            </div>

            {/* filtros */}
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block font-medium">Categoría</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full bg-white border-gray-300">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="Cultural">Culturales</SelectItem>
                    <SelectItem value="Academic">Académicos</SelectItem>
                    <SelectItem value="Sports">Deportivos</SelectItem>
                    <SelectItem value="Workshop">Talleres</SelectItem>
                    <SelectItem value="Other">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* rango de fecha */}
              <div>
                <label className="text-sm mb-2 block font-medium">Rango de Fecha</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full bg-white border-gray-300">
                    <SelectValue placeholder="Rango de fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las fechas</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* eventos en el mapa */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm mb-3 font-semibold text-gray-700">
                {isLoading ? "Cargando..." : `Eventos en el Mapa (${validEvents.length})`}
              </h3>
              {/* lista de eventos filtrados */}
              <div className="space-y-3">
                {!isLoading && validEvents.length > 0 ? (
                  validEvents.slice(0, 10).map(event => (
                    <Link
                      key={event.id}
                      to={`/event/${event.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm line-clamp-1 font-semibold">
                          {event.titulo || event.title}
                        </h4>
                        <CategoryBadge category={event.categoria || event.category} />
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {event.fecha_inicio || event.dateStart 
                          ? format(new Date(event.fecha_inicio || event.dateStart), "EEEE, d 'de' MMMM", { locale: es })
                          : "Fecha no disponible"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {event.lugar?.nombre || event.location?.name || "Ubicación no especificada"}
                      </p>
                    </Link>
                  ))
                ) : !isLoading && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No se encontraron eventos con estos filtros.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* mapa */}
        <div className="flex-1 relative">
          {!isLoading && validEvents.length > 0 ? (
            <InteractiveMap events={validEvents} center={center} />
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <p className="text-muted-foreground animate-pulse">Cargando mapa...</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <p className="text-muted-foreground">No hay eventos para mostrar en el mapa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
