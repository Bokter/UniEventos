/* @visual-only */
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import {
  fadeUp,
  motionVariants,
  staggerContainer,
} from "../../../lib/animations";
import type { EstadoPill } from "./StatusPill";

interface LiveActivityFeedProps {
  eventosData: any[];
  className?: string;
}

function parseEventDate(evento: any): Date | null {
  const raw = evento.fecha || evento.fecha_inicio || evento.dateStart;
  if (!raw) return null;
  const str = raw.includes("T") ? raw : `${raw}T${evento.hora_inicio || "12:00:00"}`;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function mapEstado(evento: any): EstadoPill {
  const estado = String(evento.estado || "").toLowerCase();
  if (estado === "terminado" || estado === "cancelado") return "terminado";
  const fin = evento.hora_fin || "23:59";
  const inicio = evento.hora_inicio || "00:00";
  const fecha = evento.fecha || "";
  if (!fecha) return "proximo";
  const now = new Date();
  const start = new Date(`${fecha}T${inicio.length <= 5 ? `${inicio}:00` : inicio}`);
  const end = new Date(`${fecha}T${fin.length <= 5 ? `${fin}:00` : fin}`);
  if (now >= start && now <= end) return "en_curso";
  if (now < start) return "por_iniciar";
  if (now > end) return "terminado";
  return "proximo";
}

const estadoColor: Record<EstadoPill, string> = {
  en_curso: "#22c55e",
  por_iniciar: "#eab308",
  terminado: "#ef4444",
  proximo: "#98C1D9",
};

function EmptyFeedIllustration() {
  return (
    <svg
      className="feed-empty-icon mx-auto mb-4"
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      aria-hidden
    >
      <rect x="20" y="30" width="80" height="50" rx="8" fill="rgba(61,90,128,0.25)" />
      <circle cx="60" cy="55" r="12" fill="rgba(238,108,77,0.4)" />
      <path
        d="M45 75h30M52 68l8 7 8-7"
        stroke="#98C1D9"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LiveActivityFeed({ eventosData, className = "" }: LiveActivityFeedProps) {
  const sorted = [...eventosData]
    .map((e) => ({ e, d: parseEventDate(e) }))
    .sort((a, b) => {
      if (!a.d && !b.d) return 0;
      if (!a.d) return 1;
      if (!b.d) return -1;
      return Math.abs(a.d.getTime() - Date.now()) - Math.abs(b.d.getTime() - Date.now());
    })
    .slice(0, 8);

  return (
    <motion.div
      variants={motionVariants(staggerContainer)}
      initial="hidden"
      animate="visible"
      className={`rounded-[var(--radius-md)] border border-white/10 bg-white/5 backdrop-blur-sm p-4 max-h-[420px] overflow-y-auto ${className}`}
    >
      <h3 className="font-h3 text-[var(--color-cyan)] mb-4">Actividad en campus</h3>

      {sorted.length === 0 ? (
        <div className="text-center py-8">
          <EmptyFeedIllustration />
          <p className="font-caption text-[var(--color-gray)]">
            No hay eventos próximos por ahora
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map(({ e: evento }, i) => {
            const titulo = evento.titulo || evento.title || "Evento";
            const lugar =
              evento.lugar?.nombre || evento.location?.name || evento.lugar_nombre || "Campus";
            const estado = mapEstado(evento);
            const fecha = parseEventDate(evento);
            const cuando = fecha
              ? format(fecha, "EEE d MMM · HH:mm", { locale: es })
              : "—";

            return (
              <motion.li
                key={evento.id ?? i}
                variants={motionVariants(fadeUp)}
                className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] hover:bg-white/5 transition-colors"
              >
                <span
                  className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 status-dot-pulse"
                  style={{
                    background: estadoColor[estado],
                    color: estadoColor[estado],
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-body text-[var(--color-cyan)] truncate text-sm font-medium">
                    {titulo}
                  </p>
                  <p className="font-caption text-[var(--color-gray)] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{lugar}</span>
                  </p>
                  <p className="font-data text-[0.75rem] text-[var(--color-orange)] mt-1">
                    {cuando}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}

LiveActivityFeed.displayName = "LiveActivityFeed";
