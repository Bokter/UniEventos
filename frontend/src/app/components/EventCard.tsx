import { Link } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { CategoryBadge } from "./CategoryBadge";
import { Card, CardContent, CardFooter } from "./ui/card";
import { StatusPill, type EstadoPill } from "./visual/StatusPill";
import { DistanceMeter } from "./visual/DistanceMeter";
import { fadeUp, motionHoverProps, motionVariants } from "../../lib/animations";

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
  if (!fecha) return "proximo";
  const now = new Date();
  const start = new Date(`${fecha}T${inicio.length <= 5 ? `${inicio}:00` : inicio}`);
  const end = new Date(`${fecha}T${fin.length <= 5 ? `${fin}:00` : fin}`);
  if (now >= start && now <= end) return "en_curso";
  if (now < start) return "por_iniciar";
  return "proximo";
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

  const estadoPill = resolverEstadoPill(evento, esPasado, esCancelado);
  const distanciaMetros: number | null =
    evento.distancia_metros ?? evento.distanciaMetros ?? null;

  // Manejo de ubicación
  const lugarNombre = evento.lugar?.nombre || evento.location?.name || "Ubicación pendiente";

  // Manejo de organizadores
  const organizadores = evento.organizadores || evento.organizers || (evento.organizador ? [evento.organizador] : []);
  const primerOrganizador = organizadores[0];
  const nombreOrganizador = primerOrganizador?.nombre_completo || primerOrganizador?.name || "Organizador";

  return (
    <Link to={`/event/${id}`} className="block h-full">
      <motion.div
        variants={motionVariants(fadeUp)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        {...motionHoverProps()}
        className="h-full"
      >
        <Card
          className="overflow-hidden h-full flex flex-col uni-card border-0"
          style={{ borderRadius: "var(--radius-md)" }}
        >
          <div
            className="overflow-hidden bg-[var(--color-light)]"
            style={{ aspectRatio: "16 / 9" }}
          >
            <img
              src={imagenPortada}
              alt={titulo}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
            />
          </div>
          <CardContent className="p-4 flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-h3 line-clamp-2 flex-1 text-[var(--color-dark)]">
                {titulo}
              </h3>
              <CategoryBadge category={categoria} />
            </div>
            <div className="space-y-1.5 text-sm text-[var(--color-gray)]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0 text-[var(--color-mid)]" />
                <span className="line-clamp-1 capitalize font-body">
                  {fechaFormateada}
                </span>
              </div>
              {rangoHora && (
                <div className="font-data text-[0.8rem] text-[var(--color-gray)]/80 pl-6">
                  {rangoHora}
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-[var(--color-mid)]" />
                <span className="line-clamp-1 font-body">{lugarNombre}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter
            className="px-4 py-3 flex flex-col gap-3 border-t"
            style={{
              borderColor: "rgba(152, 193, 217, 0.25)",
              background: "rgba(244, 249, 255, 0.6)",
            }}
          >
            <div className="flex items-center justify-between gap-3 w-full flex-wrap">
              <StatusPill estado={estadoPill} horaInicio={horaInicio} horaFin={horaFin} />
              <DistanceMeter distanciaMetros={distanciaMetros} />
            </div>
            <div className="flex items-center gap-2 w-full">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: "var(--color-orange)" }}
              >
                {nombreOrganizador.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-[var(--color-gray)] line-clamp-1 font-body">
                {nombreOrganizador}
                {organizadores.length > 1 && ` +${organizadores.length - 1}`}
              </span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
}
