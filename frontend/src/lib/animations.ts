import type { Transition, Variants } from "motion/react";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

const easeOut: Transition["ease"] = [0, 0, 0.2, 1];

/** SIMPLES */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25 },
  },
};

/** COMPLEJAS */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.08,
    },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

export const morphCard: Variants = {
  rest: { borderRadius: "8px" },
  hover: {
    borderRadius: ["8px", "16px", "8px"],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

export const pulseGlow: Variants = {
  rest: { boxShadow: "0 0 0 rgba(238, 108, 77, 0)" },
  animate: {
    boxShadow: [
      "0 0 0 rgba(238, 108, 77, 0)",
      "0 0 20px rgba(238, 108, 77, 0.45)",
      "0 0 0 rgba(238, 108, 77, 0)",
    ],
    transition: { duration: 1.5, repeat: Infinity, repeatType: "reverse" },
  },
};

/** HOVER / INTERACCIÓN */
export const hoverLift = {
  scale: 1.02,
  y: -3,
  boxShadow: "0 8px 24px rgba(238, 108, 77, 0.2)",
};

export const tapPress = { scale: 0.97 };

export const focusRing = {
  outline: "none",
  boxShadow: "0 0 0 2px #EE6C4D",
};

const reducedFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

/** Aplica prefers-reduced-motion: solo fadeIn instantáneo */
export function motionVariants(variants: Variants): Variants {
  if (!prefersReducedMotion()) return variants;
  return reducedFadeIn;
}

export function motionHoverProps() {
  if (prefersReducedMotion()) return {};
  return { whileHover: hoverLift, whileTap: tapPress };
}

export function motionFocusProps() {
  if (prefersReducedMotion()) return {};
  return { whileFocus: focusRing };
}
