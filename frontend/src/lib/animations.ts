import type { Transition, Variants } from "motion/react";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

const easeOut: Transition["ease"] = [0, 0, 0.2, 1];

/** SIMPLES */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
};

/** COMPLEJAS */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.07,
    },
  },
};

/** Alias spec */
export const stagger = staggerContainer;

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

/** Alias spec */
export const slideLeft = slideInLeft;

export const floatOrb: Variants = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
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
  rest: { boxShadow: "0 0 0 transparent" },
  animate: {
    boxShadow: [
      "0 0 0 transparent",
      "0 8px 32px var(--accent-glow)",
      "0 0 0 transparent",
    ],
    transition: { duration: 1.5, repeat: Infinity, repeatType: "reverse" },
  },
};

/** PAGE TRANSITIONS */
export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** HOVER / INTERACCIÓN */
export const hoverLift = {
  scale: 1.02,
  y: -4,
  boxShadow: "var(--shadow-glow)",
};

export const tapPress = { scale: 0.97 };

export const focusRing = {
  outline: "none",
  boxShadow: "0 0 0 2px var(--accent-primary)",
};

const reducedFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

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
