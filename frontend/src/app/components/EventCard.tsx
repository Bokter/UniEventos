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

  // Determinar si el evento ya pasó o está cancelado
  const estado = typeof evento.estado === 'string' ? evento.estado.toLowerCase() : '';
  const esCancelado = estado === 'cancelado';
  const esTerminado = estado === 'terminado';
  
  // Como fallback para la preview en PublishEventPage que no tiene estado guardado
  const horaFinEvaluar = horaFin || '23:59';
  const fechaFinStr = fechaBruta ? `${fechaBruta.split('T')[0]}T${horaFinEvaluar}:00` : null;
  const esPasado = esTerminado || (!estado && fechaFinStr ? new Date(fechaFinStr) < new Date() : false);

  // Etiqueta a mostrar
  let etiquetaEstado = null;
  if (esCancelado) {
    etiquetaEstado = (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide"
        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        Cancelado
      </span>
    );
  } else if (esPasado) {
    etiquetaEstado = (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide"
        style={{ background: 'rgba(100, 116, 139, 0.15)', color: '#94A3B8', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
        Finalizado
      </span>
    );
  }

  // Manejo de ubicación
  const lugarNombre = evento.lugar?.nombre || evento.location?.name || "Ubicación pendiente";

  // Manejo de organizadores
  const organizadores = evento.organizadores || evento.organizers || (evento.organizador ? [evento.organizador] : []);
  const primerOrganizador = organizadores[0];
  const nombreOrganizador = primerOrganizador?.nombre_completo || primerOrganizador?.name || "Organizador";

  return (
    <Link to={`/event/${id}`} className="block stagger-item">
      <Card className="card-glow overflow-hidden h-full flex flex-col"
        style={{ 
          background: '#1E293B', 
          borderColor: 'rgba(148, 163, 184, 0.1)',
          borderRadius: '0.75rem'
        }}>
        <div className="aspect-video overflow-hidden relative"
          style={{ background: '#334155' }}>
          <img
            src={imagenPortada}
            alt={titulo}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-transparent to-transparent opacity-60" />
        </div>
        <CardContent className="p-4 flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="line-clamp-2 flex-1 text-base"
              style={{ 
                fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
                fontWeight: 600, 
                color: '#F8FAFC',
                letterSpacing: '-0.01em'
              }}>
              {titulo}
            </h3>
            <div className="flex flex-col gap-1 items-end">
              <CategoryBadge category={categoria} />
              {etiquetaEstado}
            </div>
          </div>
          <div className="space-y-2 text-sm" style={{ color: '#94A3B8' }}>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: '#7C3AED' }} />
              <span className="line-clamp-1 capitalize">
                {fechaFormateada}
              </span>
            </div>
            {rangoHora && (
              <div className="text-xs pl-6" style={{ color: '#64748B' }}>
                Hora: {rangoHora}
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: '#F43F5E' }} />
              <span className="line-clamp-1">{lugarNombre}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3"
          style={{ 
            background: 'rgba(15, 23, 42, 0.5)', 
            borderTop: '1px solid rgba(148, 163, 184, 0.08)' 
          }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ 
                background: 'linear-gradient(135deg, #7C3AED 0%, #1E40AF 100%)', 
                color: '#FFFFFF' 
              }}>
              {nombreOrganizador.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm line-clamp-1" style={{ color: '#94A3B8' }}>
              {nombreOrganizador}
              {organizadores.length > 1 && ` +${organizadores.length - 1}`}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
