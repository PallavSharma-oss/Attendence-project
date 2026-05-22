// src/pages/History.jsx
import { useEffect, useMemo, useState } from 'react';
import { CalendarDaysIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useAttendance } from '../hooks/useAttendance';

const History = () => {
  const { attendanceHistory, fetchAttendanceHistory, loading } = useAttendance();
  const [monthFilter, setMonthFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setMonthFilter(month);
    if (month) {
      fetchAttendanceHistory(month);
    } else {
      fetchAttendanceHistory();
    }
    setPage(0);
  };

  const totalPages = Math.max(1, Math.ceil(attendanceHistory.length / rowsPerPage));

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '--';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const hours = Math.abs(end - start) / 36e5;
    return hours.toFixed(1) + 'h';
  };

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return attendanceHistory.slice(start, start + rowsPerPage);
  }, [attendanceHistory, page, rowsPerPage]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#E5E7EB]">Attendance History</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#9CA3AF]">View and analyze your attendance records</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-[#1F2937] dark:bg-[#111827] dark:text-[#9CA3AF] dark:hover:bg-[#1F2937]">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
          <div className="flex flex-wrap gap-4">
            <div className="w-full max-w-xs">
              <label className="text-sm font-medium text-slate-700 dark:text-[#E5E7EB]">Filter by Month</label>
              <div className="relative mt-2">
                <CalendarDaysIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type="month"
                  value={monthFilter}
                  onChange={handleMonthChange}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-[#1F2937] dark:border-t-[#6366F1]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-[#1F2937]">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-[#0B1220] dark:text-[#9CA3AF]">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Check-In</th>
                    <th className="px-6 py-3">Check-Out</th>
                    <th className="px-6 py-3">Work Hours</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm dark:divide-[#1F2937]">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500 dark:text-[#9CA3AF]">
                        No attendance records found
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((record) => (
                      <tr key={record.id} className="odd:bg-white even:bg-slate-50 hover:bg-slate-100 dark:odd:bg-[#111827] dark:even:bg-[#0F172A] dark:hover:bg-[#1F2937]">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-[#E5E7EB]">{formatDate(record.date)}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-[#9CA3AF]">{formatTime(record.checkIn)}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-[#9CA3AF]">
                          {record.checkOut ? formatTime(record.checkOut) : 'Not checked out'}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-[#E5E7EB]">
                          {calculateWorkHours(record.checkIn, record.checkOut)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={record.status} size="small" />
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-[#9CA3AF]">{record.location}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {attendanceHistory.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-500 dark:text-[#9CA3AF]">
              Showing {paginatedData.length} of {attendanceHistory.length} records
            </div>
            <div className="flex items-center gap-3">
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-[#1F2937] dark:bg-[#111827] dark:text-[#E5E7EB]"
              >
                {[5, 10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} rows
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#1F2937] dark:text-[#9CA3AF] dark:hover:bg-[#1F2937]"
                >
                  Previous
                </button>
                <span className="text-slate-500 dark:text-[#9CA3AF]">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#1F2937] dark:text-[#9CA3AF] dark:hover:bg-[#1F2937]"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default History;
