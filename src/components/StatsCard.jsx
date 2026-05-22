// src/components/StatsCard.jsx
const StatsCard = ({ label, value, colorClass = 'text-indigo-600' }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#1F2937] dark:bg-[#111827]">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#9CA3AF]">{label}</span>
      <div className={`mt-1 text-2xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
};

export default StatsCard;
