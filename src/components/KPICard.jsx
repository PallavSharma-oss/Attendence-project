// src/components/KPICard.jsx
const KPICard = ({ title, value, icon, color = 'text-indigo-600', trend, subtitle }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#1F2937] dark:bg-[#111827]">
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium text-slate-500 dark:text-[#9CA3AF]">{title}</div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-[#0B1220] ${color}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 text-3xl font-bold text-slate-900 dark:text-[#E5E7EB]">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">{subtitle}</div>}
      {trend && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className={trend.positive ? 'text-emerald-600' : 'text-rose-600'}>{trend.value}</span>
          <span className="text-slate-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
