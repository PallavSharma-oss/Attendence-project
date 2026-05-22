import React from 'react';

const WeeklyRhythmChart = ({ weeks }) => {
  const maxValue = Math.max(1, ...weeks.map((week) => week.score));

  return (
    <div className="space-y-3">
      {weeks.map((week) => (
        <div key={week.label} className="flex items-center gap-4">
          <div className="w-16 text-xs font-semibold text-slate-500 dark:text-[#9CA3AF]">
            {week.label}
          </div>
          <div className="flex-1 rounded-full bg-slate-100 dark:bg-[#0B1220]">
            <div
              className="h-2 rounded-full bg-indigo-500"
              style={{ width: `${(week.score / maxValue) * 100}%` }}
              title={`${week.score}% rhythm score`}
            />
          </div>
          <div className="w-12 text-right text-xs font-semibold text-slate-600 dark:text-[#E5E7EB]">
            {week.score}%
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeeklyRhythmChart;
