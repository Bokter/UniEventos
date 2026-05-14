import { EventCategory } from "../data/mockData";

// Soportar string normal o un objeto con { id, nombre }
interface CategoryBadgeProps {
  category: any;
  className?: string;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  // Nuevas de BD
  Academico: { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Académico': { bg: 'bg-blue-100', text: 'text-blue-700' },
  Cultural: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Deportivo: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Tecnologia: { bg: 'bg-slate-100', text: 'text-slate-700' },
  'Tecnología': { bg: 'bg-slate-100', text: 'text-slate-700' },
  'Arte y Musica': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'Arte y Música': { bg: 'bg-pink-100', text: 'text-pink-700' },
  Bienestar: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Emprendimiento: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  
  // Viejas (fallback)
  Academic: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Sports: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Workshop: { bg: 'bg-green-100', text: 'text-green-700' },
  Other: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const categoryLabels: Record<string, string> = {
  Academic: 'Académico',
  Sports: 'Deportivo',
  Workshop: 'Taller',
  Other: 'Otro',
};

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  // Extraer el nombre si es un objeto, sino usarlo como string
  const categoryName = typeof category === 'object' && category !== null ? category.nombre : category;
  
  const colors = categoryColors[categoryName] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${className}`}>
      {categoryLabels[categoryName] ?? categoryName}
    </span>
  );
}
