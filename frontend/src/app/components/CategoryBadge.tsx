import { EventCategory } from "../data/mockData";

// Soportar string normal o un objeto con { id, nombre }
interface CategoryBadgeProps {
  category: any;
  className?: string;
}

// Dark theme neon colors
const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  // Nuevas de BD - Dark theme neon style
  Academico: { bg: 'rgba(30, 64, 175, 0.15)', border: 'rgba(30, 64, 175, 0.3)', text: '#60A5FA' },
  'Académico': { bg: 'rgba(30, 64, 175, 0.15)', border: 'rgba(30, 64, 175, 0.3)', text: '#60A5FA' },
  Cultural: { bg: 'rgba(124, 58, 237, 0.15)', border: 'rgba(124, 58, 237, 0.3)', text: '#A78BFA' },
  Deportivo: { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)', text: '#FB923C' },
  Tecnologia: { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)', text: '#22D3EE' },
  'Tecnología': { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)', text: '#22D3EE' },
  'Arte y Musica': { bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)', text: '#FB7185' },
  'Arte y Música': { bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)', text: '#FB7185' },
  Bienestar: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', text: '#34D399' },
  Emprendimiento: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#FBBF24' },
  
  // Viejas (fallback)
  Academic: { bg: 'rgba(30, 64, 175, 0.15)', border: 'rgba(30, 64, 175, 0.3)', text: '#60A5FA' },
  Sports: { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)', text: '#FB923C' },
  Workshop: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', text: '#34D399' },
  Other: { bg: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.3)', text: '#94A3B8' },
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
  
  const colors = categoryColors[categoryName] || { 
    bg: 'rgba(100, 116, 139, 0.15)', 
    border: 'rgba(100, 116, 139, 0.3)', 
    text: '#94A3B8' 
  };
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text
      }}
    >
      {categoryLabels[categoryName] ?? categoryName}
    </span>
  );
}
