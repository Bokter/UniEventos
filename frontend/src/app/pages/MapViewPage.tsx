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
import { eventosApi, categoriasApi } from "../services/api.service";
import { toast } from "sonner";

export function MapViewPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [events, setEvents] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventsData, categoriesData] = await Promise.all([
          eventosApi.getAll(),
          categoriasApi.getAll()
        ]);
        setEvents(eventsData as any[]);
        setCategorias(categoriesData as any[]);
      } catch (error) {
        console.error("Error fetching data for map:", error);
        toast.error("Error al cargar datos para el mapa");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEvents = events.filter(event => {
    const catId = event.categoria?.id ? String(event.categoria.id) : null;
    const matchesCategory = selectedCategory === "all" || catId === selectedCategory;

    const fechaInicioStr = event.fecha || event.fecha_inicio || event.dateStart;
    if (!fechaInicioStr) return matchesCategory;

    const now = new Date();
    const eventDate = new Date(fechaInicioStr);

    const matchesDate = dateFilter === "all" ||
      (dateFilter === "today" && format(eventDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) ||
      (dateFilter === "week" && eventDate >= now && eventDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "month" && eventDate >= now && eventDate <= new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()));

    return matchesCategory && matchesDate;
  });

  const getCoords = (e: any): [number, number] => {
    const lat = Number(e.lugar?.latitud || e.lugar?.lat || e.location?.lat || 0);
    const lng = Number(e.lugar?.longitud || e.lugar?.lng || e.location?.lng || 0);
    return [lat, lng];
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
    : [10.9878, -74.8109];

  return (
    <div className="min-h-screen map-page-shell flex flex-col">
      <Navbar showSearch={false} />

      <div className="flex-1 flex min-h-0">
        <div className="w-80 border-r map-sidebar overflow-y-auto shrink-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-h3">Filtros</h2>
              <Link to="/">
                <Button variant="ghost" size="sm" className="dashboard-btn-outline dashboard-btn-edit">
                  <X className="h-4 w-4 mr-1" />
                  Cerrar Mapa
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <label className="uni-label">Categoría</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="uni-input mt-0 h-10">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categorias.map(cat => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="uni-label">Rango de Fecha</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="uni-input mt-0 h-10">
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

            <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <h3 className="font-h3 text-sm mb-3">
                {isLoading ? "Cargando..." : `Eventos en el Mapa (${validEvents.length})`}
              </h3>
              <div className="space-y-3">
                {!isLoading && validEvents.length > 0 ? (
                  validEvents.slice(0, 10).map(event => (
                    <Link
                      key={event.id}
                      to={`/event/${event.id}`}
                      className="map-event-card"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm line-clamp-1">
                          {event.titulo || event.title}
                        </h4>
                        <CategoryBadge category={event.categoria || event.category} />
                      </div>
                      <p className="font-caption text-xs capitalize">
                        {(() => {
                          const fechaRaw = event.fecha || event.fecha_inicio || event.dateStart;
                          if (!fechaRaw) return "Fecha no disponible";
                          const horaStr = event.hora_inicio || "";
                          const finalDate = (event.fecha && horaStr) ? `${event.fecha}T${horaStr}` : fechaRaw;
                          const d = new Date(finalDate);
                          return isNaN(d.getTime()) ? "Fecha inválida" : format(d, "EEEE, d 'de' MMMM", { locale: es });
                        })()}
                      </p>
                      <p className="font-caption text-xs line-clamp-1">
                        {event.lugar?.nombre || event.location?.name || "Ubicación no especificada"}
                      </p>
                    </Link>
                  ))
                ) : !isLoading && (
                  <p className="font-caption text-xs text-center py-4">
                    No se encontraron eventos con estos filtros.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative z-0 map-canvas-area min-h-[400px]">
          {!isLoading && validEvents.length > 0 ? (
            <InteractiveMap events={validEvents} center={center} />
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[50vh] map-loading-state">
              <p className="font-caption animate-pulse">Cargando mapa...</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[50vh] map-loading-state">
              <p className="font-caption">No hay eventos para mostrar en el mapa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
