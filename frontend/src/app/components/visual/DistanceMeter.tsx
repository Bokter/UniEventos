/* @visual-only */
import { useEffect, useMemo } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { fadeIn, motionVariants } from "../../../lib/animations";

const DIST_MAXIMA = 500;

interface DistanceMeterProps {
  distanciaMetros: number | null;
  className?: string;
}

export function DistanceMeter({ distanciaMetros, className = "" }: DistanceMeterProps) {
  const target = distanciaMetros ?? DIST_MAXIMA;
  const spring = useSpring(target, { stiffness: 120, damping: 18 });

  useEffect(() => {
    spring.set(target);
  }, [target, spring]);

  const widthPct = useTransform(spring, (v) =>
    `${Math.max(0, Math.min(100, ((DIST_MAXIMA - v) / DIST_MAXIMA) * 100))}%`
  );

  const displayLabel = useMemo(() => {
    if (distanciaMetros == null) return "—";
    if (distanciaMetros >= 1000) return `${(distanciaMetros / 1000).toFixed(1)}km`;
    return `${Math.round(distanciaMetros)}m`;
  }, [distanciaMetros]);

  return (
    <motion.div
      variants={motionVariants(fadeIn)}
      initial="hidden"
      animate="visible"
      className={`flex flex-col gap-1 min-w-[100px] ${className}`}
      title="Distancia al evento"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="uppercase tracking-wide"
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: "0.65rem",
            color: "var(--text-muted)",
          }}
        >
          Distancia
        </span>
        <motion.span
          key={displayLabel}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="font-data"
          style={{ color: "var(--text-primary)" }}
        >
          {displayLabel}
        </motion.span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--bg-base)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            width: widthPct,
            background: "linear-gradient(90deg, var(--bg-surface) 0%, var(--accent-primary) 100%)",
          }}
        />
      </div>
    </motion.div>
  );
}

DistanceMeter.displayName = "DistanceMeter";
