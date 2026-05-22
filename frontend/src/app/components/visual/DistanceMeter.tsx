/* @visual-only */
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { fadeIn, motionVariants } from "../../../lib/animations";

const DIST_MAXIMA = 500;

interface DistanceMeterProps {
  distanciaMetros: number | null;
  className?: string;
}

export function DistanceMeter({ distanciaMetros, className = "" }: DistanceMeterProps) {
  const prevRef = useRef<number | null>(null);
  const flipKey =
    distanciaMetros !== prevRef.current ? distanciaMetros : prevRef.current;

  useEffect(() => {
    prevRef.current = distanciaMetros;
  }, [distanciaMetros]);

  const metros = distanciaMetros ?? DIST_MAXIMA;
  const pct = Math.max(0, Math.min(100, ((DIST_MAXIMA - metros) / DIST_MAXIMA) * 100));
  const display =
    distanciaMetros == null ? "—" : distanciaMetros >= 1000
      ? `${(distanciaMetros / 1000).toFixed(1)}km`
      : `${Math.round(distanciaMetros)}m`;

  return (
    <motion.div
      variants={motionVariants(fadeIn)}
      initial="hidden"
      animate="visible"
      className={`flex flex-col gap-1 min-w-[100px] ${className}`}
      title="Distancia al evento"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-caption text-[0.65rem] text-[var(--color-gray)] uppercase tracking-wide">
          Distancia
        </span>
        <span key={String(flipKey)} className="font-data text-[var(--color-dark)] distance-flip">
          {display}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(152, 193, 217, 0.35)" }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            background: "linear-gradient(90deg, #3D5A80 0%, #EE6C4D 100%)",
          }}
        />
      </div>
    </motion.div>
  );
}

DistanceMeter.displayName = "DistanceMeter";
