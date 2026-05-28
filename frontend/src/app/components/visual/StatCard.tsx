/* @visual-only */
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { fadeUp, motionHoverProps, motionVariants } from "../../../lib/animations";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; positive?: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className = "" }: StatCardProps) {
  return (
    <motion.div
      variants={motionVariants(fadeUp)}
      initial="hidden"
      animate="visible"
      {...motionHoverProps()}
      className={`uni-card-dark p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="font-caption uppercase tracking-widest mb-2"
            style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
          >
            {label}
          </p>
          <p
            className="font-data"
            style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}
          >
            {value}
          </p>
          {trend != null && (
            <span
              className="inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: trend.positive !== false ? "rgba(26, 122, 74, 0.25)" : "rgba(139, 32, 32, 0.25)",
                color: trend.positive !== false ? "var(--status-green)" : "var(--status-red)",
              }}
            >
              {trend.positive !== false ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-glow)", color: "var(--text-primary)" }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

StatCard.displayName = "StatCard";
