import React from 'react';

const PresenceHeatmap = ({ hourlyPresence }) => {
  const maxValue = Math.max(1, ...hourlyPresence);

  return (
    <div className="grid grid-cols-12 gap-2">
      {hourlyPresence.map((value, index) => {
        const intensity = Math.round((value / maxValue) * 100);
        return (
          <div
            key={`hour-${index}`}
            className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-[#1F2937] dark:bg-[#0B1220]"
          >
            <div
              className="h-6 w-full rounded-md"
              style={{
                background: `rgba(99, 102, 241, ${0.15 + intensity / 120})`,
              }}
              title={`${value} active`}
            />
            <span className="text-[10px] text-slate-500 dark:text-[#9CA3AF]">
              {String(index).padStart(2, '0')}:00
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PresenceHeatmap;
