import { useState } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { X, MapPin, Calendar } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { CategoryBadge } from "../components/CategoryBadge";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { InteractiveMap } from "../components/InteractiveMap";
import { getApprovedEvents } from "../data/mockData";

export function MapViewPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const events = getApprovedEvents();

  // eventos filtrados
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;

    const now = new Date();
    const matchesDate = dateFilter === "all" ||
      (dateFilter === "today" && format(event.dateStart, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) ||
      (dateFilter === "week" && event.dateStart >= now && event.dateStart <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "month" && event.dateStart >= now && event.dateStart <= new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()));

    return matchesCategory && matchesDate;
  });

  // centro de los marcadores
  const center: [number, number] = [
    filteredEvents.reduce((sum, e) => sum + e.location.lat, 0) / filteredEvents.length || 40.7580,
    filteredEvents.reduce((sum, e) => sum + e.location.lng, 0) / filteredEvents.length || -73.9855
  ];

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
                Eventos en el Mapa ({filteredEvents.length})
              </h3>
              {/* lista de eventos filtrados */}
              <div className="space-y-3">
                {filteredEvents.length > 0 ? (
                  filteredEvents.slice(0, 10).map(event => (
                    <Link
                      key={event.id}
                      to={`/event/${event.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm line-clamp-1 font-semibold">
                          {event.title}
                        </h4>
                        <CategoryBadge category={event.category} />
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {format(event.dateStart, "EEEE, d 'de' MMMM", { locale: es })}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {event.location.name}
                      </p>
                    </Link>
                  ))
                ) : (
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
          {filteredEvents.length > 0 ? (
            <InteractiveMap events={filteredEvents} center={center} />
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
