// src/components/AttendanceCard.jsx
import StatusBadge from './StatusBadge';

const AttendanceCard = ({ attendance }) => {
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900 dark:text-[#E5E7EB]">
          {new Date(attendance.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </div>
        <StatusBadge status={attendance.status} size="small" />
      </div>

      <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-[#9CA3AF]">
        <div>
          Check-In: <span className="font-semibold text-slate-700 dark:text-[#E5E7EB]">{formatTime(attendance.checkIn)}</span>
        </div>
        <div>
          Check-Out:{' '}
          <span className="font-semibold text-slate-700 dark:text-[#E5E7EB]">
            {attendance.checkOut ? formatTime(attendance.checkOut) : 'Not checked out'}
          </span>
        </div>
        <div>
          Location: <span className="font-semibold text-slate-700 dark:text-[#E5E7EB]">{attendance.location}</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
