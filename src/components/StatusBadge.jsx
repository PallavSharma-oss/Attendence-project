// src/components/StatusBadge.jsx
const StatusBadge = ({ status, size = 'medium' }) => {
  const variants = {
    Present:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30',
    Late:
      'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30',
    Absent:
      'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/30',
    Pending:
      'bg-slate-50 text-slate-600 ring-slate-400/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/30',
  };

  const sizeClasses = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';
  const label = status || 'Pending';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset ${
        variants[label] || variants.Pending
      } ${sizeClasses}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
