import { CategoryChip } from "./visual/CategoryChip";

// Soportar string normal o un objeto con { id, nombre }
interface CategoryBadgeProps {
  category: any;
  className?: string;
}

/** Wrapper visual: misma API, nuevo CategoryChip */
export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  return <CategoryChip category={category} className={className} />;
}
