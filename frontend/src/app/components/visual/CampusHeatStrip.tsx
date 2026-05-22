/* @visual-only */
import { useMemo } from "react";
import { motion } from "motion/react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { fadeUp, motionVariants } from "../../../lib/animations";

export interface EventoAR {
  id: number;
  titulo: string;
  descripcion: string;
  hora_inicio: string;
  hora_fin: string;
  lugar_nombre: string;
  latitud: number;
  longitud: number;
}

interface CampusHeatStripProps {
  eventos: EventoAR[] | any[];
  className?: string;
}

const FRANJAS = [
  { key: "madrugada", label: "Madrugada", range: [0, 6] },
  { key: "manana", label: "Mañana", range: [6, 12] },
  { key: "mediodia", label: "Mediodía", range: [12, 14] },
  { key: "tarde", label: "Tarde", range: [14, 18] },
  { key: "noche", label: "Noche", range: [18, 24] },
] as const;

function horaToSlot(hora?: string): string {
  if (!hora) return "manana";
  const h = parseInt(hora.split(":")[0], 10);
  if (isNaN(h)) return "manana";
  for (const f of FRANJAS) {
    const [a, b] = f.range;
    if (h >= a && h < b) return f.key;
  }
  return "noche";
}

function toEventoAR(e: any): EventoAR | null {
  const hora_inicio = e.hora_inicio || "12:00";
  if (e.id == null && !e.titulo && !e.title) return null;
  return {
    id: e.id,
    titulo: e.titulo || e.title || "",
    descripcion: e.descripcion || e.description || "",
    hora_inicio,
    hora_fin: e.hora_fin || "14:00",
    lugar_nombre: e.lugar_nombre || e.lugar?.nombre || e.location?.name || "",
    latitud: Number(e.latitud ?? e.lugar?.latitud ?? 0),
    longitud: Number(e.longitud ?? e.lugar?.longitud ?? 0),
  };
}

export function CampusHeatStrip({ eventos, className = "" }: CampusHeatStripProps) {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = Object.fromEntries(
      FRANJAS.map((f) => [f.key, 0])
    );
    eventos.forEach((raw) => {
      const ev = toEventoAR(raw);
      if (!ev) return;
      const slot = horaToSlot(ev.hora_inicio);
      counts[slot] = (counts[slot] || 0) + 1;
    });
    return FRANJAS.map((f) => ({
      name: f.label,
      count: counts[f.key] || 0,
      fill:
        counts[f.key] > 3
          ? "#EE6C4D"
          : counts[f.key] > 1
            ? "#3D5A80"
            : "rgba(152, 193, 217, 0.6)",
    }));
  }, [eventos]);

  const max = Math.max(1, ...chartData.map((d) => d.count));

  return (
    <motion.div
      variants={motionVariants(fadeUp)}
      initial="hidden"
      animate="visible"
      className={`rounded-[var(--radius-md)] p-4 uni-card ${className}`}
    >
      <h3 className="font-h3 text-[var(--color-dark)] dark:text-[var(--color-cyan)] mb-1">
        Densidad del día
      </h3>
      <p className="font-caption text-[var(--color-gray)] mb-4">
        Eventos por franja horaria en campus
      </p>
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#98C1D9" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[0, max]} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

CampusHeatStrip.displayName = "CampusHeatStrip";
