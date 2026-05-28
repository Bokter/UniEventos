/* @visual-only */
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp, motionVariants } from "../../../lib/animations";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

function DefaultIllustration() {
  return (
    <svg
      className="feed-empty-icon mx-auto mb-4"
      width="100"
      height="88"
      viewBox="0 0 100 88"
      fill="none"
      aria-hidden
    >
      <rect x="14" y="20" width="72" height="48" rx="10" fill="var(--bg-elevated)" stroke="var(--border-default)" />
      <circle cx="50" cy="44" r="14" fill="var(--accent-glow)" stroke="var(--accent-primary)" strokeWidth="1.5" />
      <path d="M38 62h24" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      variants={motionVariants(fadeUp)}
      initial="hidden"
      animate="visible"
      className={`text-center py-16 px-6 uni-surface ${className}`}
    >
      {icon ?? <DefaultIllustration />}
      <h3 className="font-h3 mb-2">{title}</h3>
      <p className="font-caption max-w-md mx-auto mb-6">{description}</p>
      {action}
    </motion.div>
  );
}

EmptyState.displayName = "EmptyState";
