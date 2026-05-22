/* @logic — presentation delegates to EventCardDark */
import { Link } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EventCardDark } from "./visual/EventCardDark";
import type { EstadoPill } from "./visual/StatusPill";

interface PropiedadesTarjetaEvento {
  event: any; 
}

function resolverEstadoPill(evento: any, esPasado: boolean, esCancelado: boolean): EstadoPill {
  if (esCancelado || esPasado) return "terminado";
  const estado = String(evento.estado || "").toLowerCase();
  if (estado === "terminado") return "terminado";
  const fecha = evento.fecha || "";
  const inicio = evento.hora_inicio || "00:00";
  const fin = evento.hora_fin || "23:59";
  if (!fecha) return "futuro";
  const now = new Date();
  const start = new Date(`${fecha}T${inicio.length <= 5 ? `${inicio}:00` : inicio}`);
  const end = new Date(`${fecha}T${fin.length <= 5 ? `${fin}:00` : fin}`);
  if (now >= start && now <= end) return "en_curso";
  if (now < start) return "por_iniciar";
  return "futuro";
}

export function EventCard({ event: evento }: PropiedadesTarjetaEvento) {
  const id = evento.id;
  const titulo = evento.titulo || evento.title || "Sin título";
  const imagenPortada = evento.imagen_portada || evento.coverImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000';
  const categoria = evento.categoria || evento.category || "General";
  
  let fechaBruta = evento.fecha_inicio || evento.dateStart;
  if (!fechaBruta && evento.fecha) {
    fechaBruta = `${evento.fecha}T${evento.hora_inicio || '00:00:00'}`;
  }
  
  const fechaObjeto = fechaBruta ? new Date(fechaBruta) : new Date();
  const fechaFormateada = format(fechaObjeto, "EEE d 'de' MMM", { locale: es });

  const horaInicio = evento.hora_inicio || '';
  const horaFin = evento.hora_fin || '';
  const rangoHora = horaInicio
    ? horaFin ? `${horaInicio} – ${horaFin}` : horaInicio
    : '';

  const estado = typeof evento.estado === 'string' ? evento.estado.toLowerCase() : '';
  const esCancelado = estado === 'cancelado';
  const esTerminado = estado === 'terminado';
  
  const horaFinEvaluar = horaFin || '23:59';
  const fechaFinStr = fechaBruta ? `${fechaBruta.split('T')[0]}T${horaFinEvaluar}:00` : null;
  const esPasado = esTerminado || (!estado && fechaFinStr ? new Date(fechaFinStr) < new Date() : false);

  const estadoPill = resolverEstadoPill(evento, esPasado, esCancelado);
  const distanciaMetros: number | null =
    evento.distancia_metros ?? evento.distanciaMetros ?? null;

  const lugarNombre = evento.lugar?.nombre || evento.location?.name || "Ubicación pendiente";
  const organizadores = evento.organizadores || evento.organizers || (evento.organizador ? [evento.organizador] : []);
  const primerOrganizador = organizadores[0];
  const nombreOrganizador = primerOrganizador?.nombre_completo || primerOrganizador?.name || "Organizador";

  return (
    <Link to={`/event/${id}`} className="block h-full">
      <EventCardDark
        titulo={titulo}
        imagenPortada={imagenPortada}
        categoria={categoria}
        fechaFormateada={fechaFormateada}
        rangoHora={rangoHora}
        lugarNombre={lugarNombre}
        nombreOrganizador={nombreOrganizador}
        organizadoresCount={organizadores.length}
        estadoPill={estadoPill}
        horaInicio={horaInicio}
        horaFin={horaFin}
        distanciaMetros={distanciaMetros}
      />
    </Link>
  );
}
