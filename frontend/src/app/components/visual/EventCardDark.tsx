/* @visual-only */
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { CategoryBadge } from "../CategoryBadge";
import { StatusPill, type EstadoPill } from "./StatusPill";
import { DistanceMeter } from "./DistanceMeter";
import { fadeUp, motionHoverProps, motionVariants } from "../../../lib/animations";

export interface EventCardDarkProps {
  titulo: string;
  imagenPortada: string;
  categoria: any;
  fechaFormateada: string;
  rangoHora: string;
  lugarNombre: string;
  nombreOrganizador: string;
  organizadoresCount: number;
  estadoPill: EstadoPill;
  horaInicio: string;
  horaFin: string;
  distanciaMetros: number | null;
  className?: string;
}

export function EventCardDark({
  titulo,
  imagenPortada,
  categoria,
  fechaFormateada,
  rangoHora,
  lugarNombre,
  nombreOrganizador,
  organizadoresCount,
  estadoPill,
  horaInicio,
  horaFin,
  distanciaMetros,
  className = "",
}: EventCardDarkProps) {
  return (
    <motion.article
      variants={motionVariants(fadeUp)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      {...motionHoverProps()}
      className={`uni-card-dark overflow-hidden flex flex-col h-full ${className}`}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
        <img src={imagenPortada} alt={titulo} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, var(--bg-base) 0%, transparent 55%)",
          }}
        />
        <div className="absolute top-3 right-3">
          <CategoryBadge category={categoria} />
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <h3 className="font-h3 line-clamp-2">
          {titulo}
        </h3>

        <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
            <span className="font-body capitalize line-clamp-1">{fechaFormateada}</span>
          </div>
          {rangoHora && (
            <p className="font-data pl-6" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {rangoHora}
            </p>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
            <span className="font-body line-clamp-1">{lugarNombre}</span>
          </div>
        </div>
      </div>

      <div
        className="px-4 py-3 flex flex-col gap-3 border-t"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-elevated)" }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <StatusPill estado={estadoPill} horaInicio={horaInicio} horaFin={horaFin} />
          <DistanceMeter distanciaMetros={distanciaMetros} />
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--accent-primary)", color: "var(--text-primary)" }}
          >
            {nombreOrganizador.charAt(0).toUpperCase()}
          </div>
          <span className="font-body text-sm line-clamp-1" style={{ color: "var(--text-secondary)" }}>
            {nombreOrganizador}
            {organizadoresCount > 1 && ` +${organizadoresCount - 1}`}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

EventCardDark.displayName = "EventCardDark";
