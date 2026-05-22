/* @visual-only */
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp, motionVariants } from "../../../lib/animations";

interface CategoryChipProps {
  category: any;
  className?: string;
}

const categoryStyles: Record<string, { bg: string; text: string; icon: ReactNode }> = {
  Academico: {
    bg: "color-mix(in srgb, var(--chart-2) 25%, transparent)",
    text: "var(--chart-3)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" />
      </svg>
    ),
  },
  "Académico": {
    bg: "color-mix(in srgb, var(--chart-2) 25%, transparent)",
    text: "var(--chart-3)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" />
      </svg>
    ),
  },
  Cultural: {
    bg: "color-mix(in srgb, var(--chart-3) 20%, transparent)",
    text: "var(--text-accent)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2a3 3 0 0 1 3 3v1h2v2h-2v9a3 3 0 1 1-6 0V8H7V6h2V5a3 3 0 0 1 3-3z" fill="currentColor" />
      </svg>
    ),
  },
  Deportivo: {
    bg: "var(--accent-glow)",
    text: "var(--accent-primary)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  Tecnologia: {
    bg: "color-mix(in srgb, var(--bg-overlay) 80%, transparent)",
    text: "var(--text-secondary)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  "Tecnología": {
    bg: "color-mix(in srgb, var(--bg-overlay) 80%, transparent)",
    text: "var(--text-secondary)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  "Arte y Musica": {
    bg: "color-mix(in srgb, var(--chart-1) 18%, transparent)",
    text: "var(--accent-primary)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  "Arte y Música": {
    bg: "color-mix(in srgb, var(--chart-1) 18%, transparent)",
    text: "var(--accent-primary)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  Bienestar: {
    bg: "color-mix(in srgb, var(--status-green) 30%, transparent)",
    text: "var(--text-accent)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z" fill="currentColor" />
      </svg>
    ),
  },
  Emprendimiento: {
    bg: "color-mix(in srgb, var(--status-yellow) 35%, transparent)",
    text: "var(--text-secondary)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 17h18M6 17V9l6-4 6 4v8" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
};

const categoryLabels: Record<string, string> = {
  Academic: "Académico",
  Sports: "Deportivo",
  Workshop: "Taller",
  Other: "Otro",
};

const defaultStyle = {
  bg: "color-mix(in srgb, var(--chart-4) 25%, transparent)",
  text: "var(--text-secondary)",
  icon: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
};

export function CategoryChip({ category, className = "" }: CategoryChipProps) {
  const categoryName =
    typeof category === "object" && category !== null ? category.nombre : category;
  const style = categoryStyles[categoryName] || defaultStyle;
  const label = categoryLabels[categoryName] ?? categoryName;

  return (
    <motion.span
      variants={motionVariants(fadeUp)}
      initial="hidden"
      animate="visible"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${className}`}
      style={{
        background: style.bg,
        color: style.text,
        borderRadius: "var(--radius-pill)",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <span className="opacity-90">{style.icon}</span>
      {label}
    </motion.span>
  );
}

CategoryChip.displayName = "CategoryChip";
