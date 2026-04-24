import { EventCategory } from "../data/mockData";

interface CategoryBadgeProps {
  category: EventCategory;
  className?: string;
}

const categoryColors: Record<EventCategory, { bg: string; text: string }> = {
  Cultural: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Academic: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Sports: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Workshop: { bg: 'bg-green-100', text: 'text-green-700' },
  Other: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const colors = categoryColors[category as EventCategory] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${className}`}>
      {category}
    </span>
  );
}
