import { EventStatus } from "../data/mockData";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

// Dark theme neon style status badges
const statusStyles: Record<string, { bg: string; border: string; text: string }> = {
  borrador: { bg: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.3)', text: '#94A3B8' },
  pendiente: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#FBBF24' },
  aprobado: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', text: '#34D399' },
  rechazado: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#F87171' },
  cancelado: { bg: 'rgba(100, 116, 139, 0.1)', border: 'rgba(100, 116, 139, 0.2)', text: '#64748B' },
  terminado: { bg: 'rgba(30, 64, 175, 0.15)', border: 'rgba(30, 64, 175, 0.3)', text: '#60A5FA' },
  // Fallbacks for legacy status values
  Draft: { bg: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.3)', text: '#94A3B8' },
  'In review': { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#FBBF24' },
  Pending: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#FBBF24' },
  Approved: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', text: '#34D399' },
  Rejected: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#F87171' },
  Cancelled: { bg: 'rgba(100, 116, 139, 0.1)', border: 'rgba(100, 116, 139, 0.2)', text: '#64748B' },
};

const statusLabels: Record<string, string> = {
  borrador: 'Borrador',
  pendiente: 'En revisión',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  cancelado: 'Cancelado',
  terminado: 'Finalizado',
  Draft: 'Borrador',
  'In review': 'En revisión',
  Pending: 'Pendiente',
  Approved: 'Aprobado',
  Rejected: 'Rechazado',
  Cancelled: 'Cancelado',
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const styles = statusStyles[status] || { 
    bg: 'rgba(100, 116, 139, 0.15)', 
    border: 'rgba(100, 116, 139, 0.3)', 
    text: '#94A3B8' 
  };
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        color: styles.text
      }}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}
