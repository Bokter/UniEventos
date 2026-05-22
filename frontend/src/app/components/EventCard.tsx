import { Link } from "react-router";
import { motion } from "motion/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { Card, CardContent, CardFooter } from "./ui/card";

interface PropiedadesTarjetaEvento {
  event: any;
  /** Optional index used by parent stagger — kept for compatibility, stagger now handled by parent motion.div */
  index?: number;
}

export function EventCard({ event: evento }: PropiedadesTarjetaEvento) {
  // Manejo de nombres de propiedades tanto del Mock como del Backend
  const id = evento.id;
  const titulo = evento.titulo || evento.title || "Sin título";
  const imagenPortada =
    evento.imagen_portada ||
    evento.coverImage ||
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000";
  const categoria = evento.categoria || evento.category || "General";

  // Manejo de fecha
  let fechaBruta = evento.fecha_inicio || evento.dateStart;
  if (!fechaBruta && evento.fecha) {
    fechaBruta = `${evento.fecha}T${evento.hora_inicio || "00:00:00"}`;
  }

  const fechaObjeto = fechaBruta ? new Date(fechaBruta) : new Date();
  const fechaFormateada = format(fechaObjeto, "EEE d 'de' MMM", { locale: es });

  // Rango de hora
  const horaInicio = evento.hora_inicio || "";
  const horaFin = evento.hora_fin || "";
  const rangoHora = horaInicio
    ? horaFin
      ? `${horaInicio} – ${horaFin}`
      : horaInicio
    : "";

  // Estado del evento
  const estado = typeof evento.estado === "string" ? evento.estado.toLowerCase() : "";
  const esCancelado = estado === "cancelado";
  const esTerminado = estado === "terminado";

  const horaFinEvaluar = horaFin || "23:59";
  const fechaFinStr = fechaBruta
    ? `${fechaBruta.split("T")[0]}T${horaFinEvaluar}:00`
    : null;
  const esPasado =
    esTerminado || (!estado && fechaFinStr ? new Date(fechaFinStr) < new Date() : false);

  let etiquetaEstado = null;
  if (esCancelado) {
    etiquetaEstado = (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase tracking-wide">
        Cancelado
      </span>
    );
  } else if (esPasado) {
    etiquetaEstado = (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600 uppercase tracking-wide">
        Finalizado
      </span>
    );
  }

  const lugarNombre =
    evento.lugar?.nombre || evento.location?.name || "Ubicación pendiente";

  const organizadores =
    evento.organizadores ||
    evento.organizers ||
    (evento.organizador ? [evento.organizador] : []);
  const primerOrganizador = organizadores[0];
  const nombreOrganizador =
    primerOrganizador?.nombre_completo || primerOrganizador?.name || "Organizador";

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.22, ease: "easeOut" } }}
      whileTap={{ scale: 0.975 }}
      style={{ cursor: "pointer" }}
    >
      <Link to={`/event/${id}`} style={{ textDecoration: "none" }}>
        <Card
          className="overflow-hidden border border-gray-200 rounded-xl h-full flex flex-col group"
          style={{
            transition: "box-shadow 0.25s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 12px 32px rgba(41,50,65,0.13)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 1px 3px rgba(0,0,0,0.06)";
          }}
        >
          {/* Cover image with zoom on hover */}
          <div className="aspect-video overflow-hidden bg-gray-100 relative">
            <img
              src={imagenPortada}
              alt={titulo}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Subtle gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(41,50,65,0.18) 0%, transparent 60%)",
              }}
            />
          </div>

          {/* Content */}
          <CardContent className="p-4 flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                className="line-clamp-2 flex-1 text-gray-900"
                style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "1rem" }}
              >
                {titulo}
              </h3>
              <div className="flex flex-col gap-1 items-end shrink-0">
                <CategoryBadge category={categoria} />
                {etiquetaEstado}
              </div>
            </div>

            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" style={{ color: "#3D5A80" }} />
                <span className="line-clamp-1 capitalize">{fechaFormateada}</span>
              </div>
              {rangoHora && (
                <div className="text-xs text-muted-foreground/70 pl-6">
                  Hora: {rangoHora}
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: "#3D5A80" }} />
                <span className="line-clamp-1">{lugarNombre}</span>
              </div>
            </div>
          </CardContent>

          {/* Footer with accent left border */}
          <CardFooter
            className="px-4 py-3 border-t border-gray-100"
            style={{ background: "rgba(240,250,244,0.6)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ background: "#EE6C4D" }}
              >
                {nombreOrganizador.charAt(0).toUpperCase()}
              </div>
              <span
                className="text-sm text-muted-foreground line-clamp-1"
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                {nombreOrganizador}
                {organizadores.length > 1 && ` +${organizadores.length - 1}`}
              </span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
