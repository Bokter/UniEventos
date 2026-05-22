/* @visual-only */
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { fadeIn, motionVariants } from "../../../lib/animations";

export type EstadoPill = "en_curso" | "por_iniciar" | "terminado" | "proximo";

interface StatusPillProps {
  estado: EstadoPill | string;
  horaInicio?: string;
  horaFin?: string;
  className?: string;
}

const config: Record<
  EstadoPill,
  { label: string; dot: string; bg: string; text: string; pulse?: boolean }
> = {
  en_curso: {
    label: "En curso",
    dot: "#22c55e",
    bg: "rgba(34, 197, 94, 0.15)",
    text: "#15803d",
    pulse: true,
  },
  por_iniciar: {
    label: "Por iniciar",
    dot: "#eab308",
    bg: "rgba(234, 179, 8, 0.15)",
    text: "#a16207",
  },
  terminado: {
    label: "Terminado",
    dot: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    text: "#b91c1c",
  },
  proximo: {
    label: "Próximo",
    dot: "#98C1D9",
    bg: "rgba(152, 193, 217, 0.2)",
    text: "#3D5A80",
  },
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

function resolveCountdownTarget(
  estado: string,
  horaInicio?: string,
  horaFin?: string
): number | null {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  const toMs = (time?: string, end = false) => {
    if (!time) return null;
    const t = time.length <= 5 ? `${time}:00` : time;
    const d = new Date(`${today}T${t}`);
    return isNaN(d.getTime()) ? null : d.getTime();
  };

  if (estado === "en_curso" && horaFin) {
    const end = toMs(horaFin, true);
    return end && end > now ? end - now : null;
  }
  if ((estado === "por_iniciar" || estado === "proximo") && horaInicio) {
    const start = toMs(horaInicio);
    return start && start > now ? start - now : null;
  }
  return null;
}

export function StatusPill({ estado, horaInicio, horaFin, className = "" }: StatusPillProps) {
  const key = (estado in config ? estado : "proximo") as EstadoPill;
  const c = config[key];
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const ms = resolveCountdownTarget(key, horaInicio, horaFin);
      setCountdown(ms != null ? formatCountdown(ms) : null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [key, horaInicio, horaFin]);

  return (
    <motion.div
      variants={motionVariants(fadeIn)}
      initial="hidden"
      animate="visible"
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full font-caption ${className}`}
      style={{ background: c.bg, color: c.text, borderRadius: "var(--radius-pill)" }}
    >
      <span
        className={c.pulse ? "status-dot-pulse w-2 h-2 rounded-full shrink-0" : "w-2 h-2 rounded-full shrink-0"}
        style={{ background: c.dot, color: c.dot }}
      />
      <span className="font-medium text-[0.75rem]">{c.label}</span>
      {countdown && (
        <span className="font-data text-[0.7rem] opacity-80 tabular-nums">{countdown}</span>
      )}
    </motion.div>
  );
}

StatusPill.displayName = "StatusPill";
