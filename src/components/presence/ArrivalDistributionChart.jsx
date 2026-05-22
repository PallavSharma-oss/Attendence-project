import React from 'react';

const ArrivalDistributionChart = ({ arrivals }) => {
  const maxValue = Math.max(1, ...arrivals);

  return (
    <div className="flex h-48 items-end gap-2">
      {arrivals.map((value, index) => (
        <div key={`arrival-${index}`} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-full w-full items-end rounded-lg bg-slate-50 px-1 dark:bg-[#0B1220]">
            <div
              className="w-full rounded-lg bg-emerald-500/80"
              style={{ height: `${(value / maxValue) * 100}%` }}
              title={`${value} arrivals`}
            />
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-[#9CA3AF]">
            {String(index).padStart(2, '0')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ArrivalDistributionChart;
