/* @visual-only */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`uni-card-dark overflow-hidden flex flex-col ${className}`}
      style={{ borderRadius: "var(--radius-md)" }}
      aria-hidden
    >
      <div className="uni-shimmer" style={{ aspectRatio: "16 / 9" }} />
      <div className="p-4 space-y-3">
        <div className="uni-shimmer h-5 rounded-md w-3/4" />
        <div className="uni-shimmer h-3 rounded-md w-1/2" />
        <div className="uni-shimmer h-3 rounded-md w-2/3" />
        <div className="flex gap-2 pt-2">
          <div className="uni-shimmer h-8 rounded-full flex-1" />
          <div className="uni-shimmer h-8 rounded-full flex-1" />
        </div>
      </div>
    </div>
  );
}

SkeletonCard.displayName = "SkeletonCard";
