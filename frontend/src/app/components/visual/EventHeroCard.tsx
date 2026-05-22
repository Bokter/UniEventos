/* @visual-only */
import { motion } from "motion/react";
import { CategoryChip } from "./CategoryChip";
import { StatusPill, type EstadoPill } from "./StatusPill";
import { fadeUp, motionVariants, slideInLeft, staggerContainer } from "../../../lib/animations";

interface EventHeroCardProps {
  imagenPortada: string;
  titulo: string;
  categoria: any;
  fechaInicio: string;
  estado: EstadoPill | string;
  horaInicio?: string;
  horaFin?: string;
  className?: string;
}

const PARTICLE_SEEDS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${8 + (i * 9) % 85}%`,
  top: `${12 + (i * 7) % 70}%`,
  size: 4 + (i % 4) * 2,
  delay: `${(i * 0.7) % 5}s`,
  duration: `${5 + (i % 4)}s`,
}));

export function EventHeroCard({
  imagenPortada,
  titulo,
  categoria,
  fechaInicio,
  estado,
  horaInicio,
  horaFin,
  className = "",
}: EventHeroCardProps) {
  return (
    <motion.section
      variants={motionVariants(staggerContainer)}
      initial="hidden"
      animate="visible"
      className={`relative overflow-hidden uni-card-dark hero-parallax-wrap ${className}`}
      style={{ minHeight: "280px" }}
    >
      <div className="hero-parallax-inner absolute inset-0">
        <img
          src={imagenPortada}
          alt={titulo}
          className="w-full h-full object-cover"
          style={{ minHeight: "280px" }}
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, var(--bg-base) 0%, transparent 55%)",
        }}
      />

      {PARTICLE_SEEDS.map((p) => (
        <span
          key={p.id}
          className="hero-particle pointer-events-none"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            background: "var(--accent-glow)",
          }}
        />
      ))}

      <motion.div
        variants={motionVariants(slideInLeft)}
        className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10"
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <CategoryChip category={categoria} />
          <StatusPill estado={estado} horaInicio={horaInicio} horaFin={horaFin} />
        </div>
        <motion.h1
          variants={motionVariants(fadeUp)}
          className="font-h1 mb-2"
          style={{
            color: "var(--text-primary)",
            textShadow: "0 2px 20px var(--accent-glow)",
          }}
        >
          {titulo}
        </motion.h1>
        <p className="font-data" style={{ color: "var(--text-secondary)" }}>{fechaInicio}</p>
      </motion.div>
    </motion.section>
  );
}

EventHeroCard.displayName = "EventHeroCard";
