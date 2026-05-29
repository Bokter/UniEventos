/* @visual-only */
interface SectionDividerProps {
  label: string;
  accentColor?: string;
  className?: string;
}

export function SectionDivider({
  label,
  accentColor = "var(--accent-primary)",
  className = "",
}: SectionDividerProps) {
  return (
    <div className={`flex items-center gap-4 my-8 ${className}`}>
      <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
      <span
        className="font-caption shrink-0 uppercase tracking-widest text-xs"
        style={{ color: accentColor }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
    </div>
  );
}

SectionDivider.displayName = "SectionDivider";
