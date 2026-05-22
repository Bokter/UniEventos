/* @visual-only */
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { fadeIn, motionVariants } from "../../../lib/animations";

export type EstadoPill = "en_curso" | "por_iniciar" | "terminado" | "proximo" | "futuro";

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
    dot: "var(--status-green)",
    bg: "rgba(26, 122, 74, 0.2)",
    text: "var(--text-accent)",
    pulse: true,
  },
  por_iniciar: {
    label: "Por iniciar",
    dot: "var(--status-yellow)",
    bg: "rgba(138, 104, 0, 0.2)",
    text: "var(--text-secondary)",
  },
  terminado: {
    label: "Terminado",
    dot: "var(--status-red)",
    bg: "rgba(139, 32, 32, 0.2)",
    text: "var(--text-secondary)",
  },
  proximo: {
    label: "Próximo",
    dot: "var(--text-muted)",
    bg: "rgba(45, 55, 72, 0.4)",
    text: "var(--text-secondary)",
  },
  futuro: {
    label: "Próximo",
    dot: "var(--text-muted)",
    bg: "rgba(45, 55, 72, 0.4)",
    text: "var(--text-secondary)",
  },
};

function normalizeEstado(estado: string): EstadoPill {
  if (estado in config) return estado as EstadoPill;
  return "futuro";
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

function resolveCountdownTarget(
  estado: EstadoPill,
  horaInicio?: string,
  horaFin?: string
): number | null {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  const toMs = (time?: string) => {
    if (!time) return null;
    const t = time.length <= 5 ? `${time}:00` : time;
    const d = new Date(`${today}T${t}`);
    return isNaN(d.getTime()) ? null : d.getTime();
  };

  if (estado === "en_curso" && horaFin) {
    const end = toMs(horaFin);
    return end && end > now ? end - now : null;
  }
  if ((estado === "por_iniciar" || estado === "proximo" || estado === "futuro") && horaInicio) {
    const start = toMs(horaInicio);
    return start && start > now ? start - now : null;
  }
  return null;
}

export function StatusPill({ estado, horaInicio, horaFin, className = "" }: StatusPillProps) {
  const key = normalizeEstado(String(estado));
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
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full ${className}`}
      style={{
        background: c.bg,
        color: c.text,
        borderRadius: "var(--radius-pill)",
        fontFamily: "'Manrope', sans-serif",
        fontWeight: 500,
        fontSize: "0.75rem",
      }}
    >
      <span
        className={c.pulse ? "status-dot-pulse w-2 h-2 rounded-full shrink-0" : "w-2 h-2 rounded-full shrink-0"}
        style={{ background: c.dot }}
      />
      <span>{c.label}</span>
      {countdown && (
        <span className="font-data opacity-80 tabular-nums" style={{ fontSize: "0.7rem" }}>
          {countdown}
        </span>
      )}
    </motion.div>
  );
}

StatusPill.displayName = "StatusPill";
