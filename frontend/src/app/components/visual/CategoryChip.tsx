/* @visual-only */
import { motion } from "motion/react";
import { fadeUp, motionVariants } from "../../../lib/animations";

interface CategoryChipProps {
  category: any;
  className?: string;
}

import type { ReactNode } from "react";

const categoryStyles: Record<string, { bg: string; text: string; icon: ReactNode }> = {
  Academico: {
    bg: "rgba(61, 90, 128, 0.2)",
    text: "#3D5A80",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" />
      </svg>
    ),
  },
  "Académico": {
    bg: "rgba(61, 90, 128, 0.2)",
    text: "#3D5A80",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" />
      </svg>
    ),
  },
  Cultural: {
    bg: "rgba(147, 51, 234, 0.15)",
    text: "#7c3aed",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2a3 3 0 0 1 3 3v1h2v2h-2v9a3 3 0 1 1-6 0V8H7V6h2V5a3 3 0 0 1 3-3z" fill="currentColor" />
      </svg>
    ),
  },
  Deportivo: {
    bg: "rgba(238, 108, 77, 0.15)",
    text: "#EE6C4D",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M5 12h14M12 5c2 3 2 11 0 14M12 5c-2 3-2 11 0 14" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  Tecnologia: {
    bg: "rgba(41, 50, 65, 0.12)",
    text: "#293241",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  "Tecnología": {
    bg: "rgba(41, 50, 65, 0.12)",
    text: "#293241",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  "Arte y Musica": {
    bg: "rgba(236, 72, 153, 0.12)",
    text: "#db2777",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="18" r="3" fill="currentColor" />
        <circle cx="18" cy="16" r="3" fill="currentColor" />
      </svg>
    ),
  },
  "Arte y Música": {
    bg: "rgba(236, 72, 153, 0.12)",
    text: "#db2777",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="18" r="3" fill="currentColor" />
        <circle cx="18" cy="16" r="3" fill="currentColor" />
      </svg>
    ),
  },
  Bienestar: {
    bg: "rgba(34, 197, 94, 0.12)",
    text: "#16a34a",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z" fill="currentColor" />
      </svg>
    ),
  },
  Emprendimiento: {
    bg: "rgba(234, 179, 8, 0.15)",
    text: "#ca8a04",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 17h18M6 17V9l6-4 6 4v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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
  bg: "rgba(152, 193, 217, 0.2)",
  text: "#3D5A80",
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-caption shrink-0 ${className}`}
      style={{
        background: style.bg,
        color: style.text,
        borderRadius: "var(--radius-pill)",
      }}
    >
      <span className="opacity-90">{style.icon}</span>
      {label}
    </motion.span>
  );
}

CategoryChip.displayName = "CategoryChip";
