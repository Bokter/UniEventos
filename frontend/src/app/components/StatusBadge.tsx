import { EventStatus } from "../data/mockData";

// Usamos string para soportar cualquier estado que venga del backend
interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  borrador: { bg: 'bg-gray-100', text: 'text-gray-700' },
  pendiente: { bg: 'bg-amber-100', text: 'text-amber-700' },
  aprobado: { bg: 'bg-green-100', text: 'text-green-700' },
  rechazado: { bg: 'bg-red-100', text: 'text-red-700' },
  cancelado: { bg: 'bg-gray-100', text: 'text-gray-500' },
  // Fallbacks por si acaso queda algo viejo:
  Draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
  'In review': { bg: 'bg-amber-100', text: 'text-amber-700' },
  Approved: { bg: 'bg-green-100', text: 'text-green-700' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700' },
  Cancelled: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

const statusLabels: Record<string, string> = {
  borrador: 'Borrador',
  pendiente: 'En revisión',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  cancelado: 'Cancelado',
  Draft: 'Borrador',
  'In review': 'En revisión',
  Approved: 'Aprobado',
  Rejected: 'Rechazado',
  Cancelled: 'Cancelado',
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const styles = statusStyles[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${styles.bg} ${styles.text} ${className}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}
