import { Link } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // Importación del idioma español
import { Calendar, MapPin } from "lucide-react";
import { Event } from "../data/mockData";
import { CategoryBadge } from "./CategoryBadge";
import { Card, CardContent, CardFooter } from "./ui/card";

// Interfaz para las propiedades de la tarjeta en español
interface PropiedadesTarjetaEvento {
  event: Event; // Mantenemos el nombre de la propiedad para no romper la compatibilidad externa
}

export function EventCard({ event: evento }: PropiedadesTarjetaEvento) {
  // Formateamos la fecha usando el locale de español
  // MMM: Mes abreviado, d: día, yyyy: año, h:mm a: hora y am/pm
  const fechaFormateada = format(evento.dateStart, 'MMM d, yyyy • h:mm a', { locale: es });

  return (
    <Link to={`/event/${evento.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200 rounded-lg h-full">
        <div className="aspect-video overflow-hidden">
          <img
            src={evento.coverImage}
            alt={evento.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="line-clamp-2 flex-1" style={{ fontWeight: 600 }}>
              {evento.title}
            </h3>
            <CategoryBadge category={evento.category} />
          </div>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1 capitalize">
                {fechaFormateada}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{evento.location.name}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
              {evento.organizer.name.charAt(0)}
            </div>
            <span className="text-sm text-muted-foreground line-clamp-1">
              {evento.organizer.name}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
