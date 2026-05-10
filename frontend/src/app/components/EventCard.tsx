import { Link } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { Card, CardContent, CardFooter } from "./ui/card";

interface PropiedadesTarjetaEvento {
  event: any; 
}

export function EventCard({ event: evento }: PropiedadesTarjetaEvento) {
  // Manejo de nombres de propiedades tanto del Mock como del Backend
  const id = evento.id;
  const titulo = evento.titulo || evento.title || "Sin título";
  const imagenPortada = evento.imagen_portada || evento.coverImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000';
  const categoria = evento.categoria || evento.category || "General";
  
  // Manejo de fecha
  let fechaBruta = evento.fecha_inicio || evento.dateStart;
  if (!fechaBruta && evento.fecha) {
    fechaBruta = `${evento.fecha}T${evento.hora_inicio || '00:00:00'}`;
  }
  
  const fechaObjeto = fechaBruta ? new Date(fechaBruta) : new Date();
  const fechaFormateada = format(fechaObjeto, "EEE d 'de' MMM", { locale: es });

  // Rango de hora
  const horaInicio = evento.hora_inicio || '';
  const horaFin = evento.hora_fin || '';
  const rangoHora = horaInicio
    ? horaFin ? `${horaInicio} – ${horaFin}` : horaInicio
    : '';

  // Determinar si el evento ya pasó
  const horaFinEvaluar = horaFin || '23:59';
  const fechaFinStr = fechaBruta ? `${fechaBruta.split('T')[0]}T${horaFinEvaluar}:00` : null;
  const esPasado = fechaFinStr ? new Date(fechaFinStr) < new Date() : false;

  // Manejo de ubicación
  const lugarNombre = evento.lugar?.nombre || evento.location?.name || "Ubicación pendiente";

  // Manejo de organizadores
  const organizadores = evento.organizadores || evento.organizers || (evento.organizador ? [evento.organizador] : []);
  const primerOrganizador = organizadores[0];
  const nombreOrganizador = primerOrganizador?.nombre_completo || primerOrganizador?.name || "Organizador";

  return (
    <Link to={`/event/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200 rounded-lg h-full flex flex-col">
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img
            src={imagenPortada}
            alt={titulo}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4 flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="line-clamp-2 flex-1" style={{ fontWeight: 600 }}>
              {titulo}
            </h3>
            <div className="flex flex-col gap-1 items-end">
              <CategoryBadge category={categoria} />
              {esPasado && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600 uppercase tracking-wide">
                  Finalizado
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1 capitalize">
                {fechaFormateada}
              </span>
            </div>
            {rangoHora && (
              <div className="text-xs text-muted-foreground/70 pl-6">{rangoHora}</div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{lugarNombre}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
              {nombreOrganizador.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-muted-foreground line-clamp-1">
              {nombreOrganizador}
              {organizadores.length > 1 && ` +${organizadores.length - 1}`}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
