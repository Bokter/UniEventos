import { EventStatus } from "../data/mockData";

interface StatusBadgeProps {
  status: EventStatus;
  className?: string;
}

const statusStyles: Record<EventStatus, { bg: string; text: string }> = {
  Draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
  'In review': { bg: 'bg-amber-100', text: 'text-amber-700' },
  Approved: { bg: 'bg-green-100', text: 'text-green-700' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700' },
  Cancelled: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const styles = statusStyles[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${styles.bg} ${styles.text} ${className}`}>
      {status}
    </span>
  );
}
