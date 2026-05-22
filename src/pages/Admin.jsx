import { useEffect, useMemo, useState } from 'react';
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import KPICard from '../components/KPICard';
import { useAttendance } from '../hooks/useAttendance';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import EditUserModal from '../components/EditUserModal';
import LeaveReviewModal from '../components/LeaveReviewModal';
import { getAllUsers } from '../services/userService';

const Admin = () => {
  const { user: currentUser, userDetails } = useAuth();
  const { addToast } = useToast();
  const { fetchAllAttendance } = useAttendance();
  const {
    updateUser,
    deleteUser,
    fetchAllLeaveRequests,
    approveLeaveRequest,
    declineLeaveRequest,
    fetchAttendanceInsights,
  } = useAdmin();
  
  const [users, setUsers] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsRunning, setInsightsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [leaveReviewModal, setLeaveReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [filters, setFilters] = useState({
    start: '',
    end: '',
    department: 'All',
    search: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchAttendanceData();
    fetchLeaves();
    fetchInsights();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const records = await fetchAllAttendance();
      setAllAttendance(records);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const leaveData = await fetchAllLeaveRequests();
      setLeaves(leaveData);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);
      const insightsData = await fetchAttendanceInsights();
      setInsights(insightsData);
      setInsightsLoading(false);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsightsLoading(false);
    }
  };

  // User Management Handlers
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserModal(true);
  };

  const handleSaveUser = async (userId, updates) => {
    const result = await updateUser(userId, updates);
    if (result.success) {
      addToast({
        type: 'success',
        title: 'User updated',
        message: 'User details have been updated successfully.',
      });
      setEditUserModal(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh users list
    } else {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: result.error || 'Failed to update user.',
      });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    const result = await deleteUser(userId);
    if (result.success) {
      addToast({
        type: 'success',
        title: 'User deleted',
        message: `${userName} has been removed from the system.`,
      });
      fetchUsers(); // Refresh users list
    } else {
      addToast({
        type: 'error',
        title: 'Delete failed',
        message: result.error || 'Failed to delete user.',
      });
    }
  };

  // Leave Management Handlers
  const handleReviewLeave = (leave) => {
    setSelectedLeave(leave);
    setLeaveReviewModal(true);
  };

  const handleApproveLeave = async (leaveId, comments) => {
    const result = await approveLeaveRequest(
      leaveId,
      currentUser.uid,
      userDetails?.name || 'Admin',
      comments
    );

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Leave approved',
        message: 'Leave request has been approved.',
      });
      fetchLeaves(); // Refresh leaves list
    } else {
      addToast({
        type: 'error',
        title: 'Approval failed',
        message: result.error || 'Failed to approve leave.',
      });
    }
  };

  const handleDeclineLeave = async (leaveId, comments) => {
    const result = await declineLeaveRequest(
      leaveId,
      currentUser.uid,
      userDetails?.name || 'Admin',
      comments
    );

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Leave declined',
        message: 'Leave request has been declined.',
      });
      fetchLeaves(); // Refresh leaves list
    } else {
      addToast({
        type: 'error',
        title: 'Decline failed',
        message: result.error || 'Failed to decline leave.',
      });
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '--';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const hours = Math.abs(end - start) / 36e5;
    return `${hours.toFixed(1)}h`;
  };

  const toDateOnly = (dateString) => {
    if (!dateString) return null;
    return new Date(`${dateString}T00:00:00`);
  };

  const dateToYMD = (date) => date.toISOString().split('T')[0];

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const hours = Math.abs(end - start) / 36e5;
    return Number.isFinite(hours) ? hours : 0;
  };

  const buildAnomalies = ({ consistencyScore, lateRate, overtimeAverage, absenteeRisk }) => {
    const anomalies = [];

    if (absenteeRisk >= 70) {
      anomalies.push({
        type: 'absentee_risk',
        severity: 'high',
        message: 'High absentee risk detected.',
      });
    }

    if (consistencyScore <= 60) {
      anomalies.push({
        type: 'low_consistency',
        severity: 'medium',
        message: 'Low attendance consistency over the last 30 days.',
      });
    }

    if (lateRate >= 0.3) {
      anomalies.push({
        type: 'late_arrivals',
        severity: 'medium',
        message: 'Frequent late arrivals detected.',
      });
    }

    if (overtimeAverage >= 2) {
      anomalies.push({
        type: 'overtime_spike',
        severity: 'low',
        message: 'Sustained overtime above 2 hours/day.',
      });
    }

    return anomalies;
  };

  const summarizeUser = ({
    userName,
    windowDays,
    uniqueDays,
    consistencyScore,
    lateRate,
    latenessTrend,
    overtimeAverage,
    absenteeRisk,
  }) => {
    const latePercent = Math.round(lateRate * 100);
    const overtimeText = overtimeAverage > 0 ? `${overtimeAverage.toFixed(1)}h avg overtime` : 'no significant overtime';
    const trendText = latenessTrend === 'improving'
      ? 'late arrivals are improving'
      : latenessTrend === 'worsening'
        ? 'late arrivals are increasing'
        : 'late arrivals are stable';

    return `${userName} attended ${uniqueDays}/${windowDays} days (consistency ${consistencyScore}%). ${trendText} (${latePercent}% late). ${overtimeText}. Absentee risk score: ${absenteeRisk}/100.`;
  };

  const runInsights = async () => {
    try {
      setInsightsRunning(true);

      if (allAttendance.length === 0) {
        await fetchAttendanceData();
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 29);

      const windowStart = dateToYMD(startDate);
      const windowEnd = dateToYMD(endDate);
      const windowDays = 30;

      const attendanceWindow = allAttendance.filter(
        (record) => record.date >= windowStart && record.date <= windowEnd
      );

      const attendanceByUser = new Map();
      attendanceWindow.forEach((record) => {
        if (!record.userId) return;
        if (!attendanceByUser.has(record.userId)) {
          attendanceByUser.set(record.userId, []);
        }
        attendanceByUser.get(record.userId).push(record);
      });

      const generatedInsights = [];

      users.forEach((user) => {
        if (user.isActive === false) return;
        const userId = user._id || user.uid || user.id || user.userId;
        if (!userId) return;

        const records = attendanceByUser.get(userId) || [];
        const uniqueDays = new Set(records.map((r) => r.date)).size;

        const lateRecords = records.filter((record) => record.status === 'Late');
        const lateRate = records.length ? lateRecords.length / records.length : 0;

        const last7Start = new Date(endDate);
        last7Start.setDate(endDate.getDate() - 6);
        const prev7Start = new Date(endDate);
        prev7Start.setDate(endDate.getDate() - 13);

        const last7StartStr = dateToYMD(last7Start);
        const prev7StartStr = dateToYMD(prev7Start);
        const last7EndStr = windowEnd;
        const prev7EndDate = new Date(endDate);
        prev7EndDate.setDate(endDate.getDate() - 7);
        const prev7EndStr = dateToYMD(prev7EndDate);

        const last7 = records.filter((record) => record.date >= last7StartStr && record.date <= last7EndStr);
        const prev7 = records.filter((record) => record.date >= prev7StartStr && record.date <= prev7EndStr);

        const last7LateRate = last7.length ? last7.filter((r) => r.status === 'Late').length / last7.length : 0;
        const prev7LateRate = prev7.length ? prev7.filter((r) => r.status === 'Late').length / prev7.length : 0;

        const latenessDelta = last7LateRate - prev7LateRate;
        const latenessTrend = latenessDelta > 0.1 ? 'worsening' : latenessDelta < -0.1 ? 'improving' : 'stable';

        const overtimeValues = records.map((record) => {
          const hours = calculateHours(record.checkIn, record.checkOut);
          return Math.max(0, hours - 8);
        });
        const overtimeAverage = overtimeValues.length
          ? overtimeValues.reduce((sum, value) => sum + value, 0) / overtimeValues.length
          : 0;

        const consistencyScore = Math.round((uniqueDays / windowDays) * 100);
        const absenceRate = 1 - uniqueDays / windowDays;
        const overtimeFactor = clamp(overtimeAverage / 3, 0, 1);
        const absenteeRisk = Math.round(
          clamp(absenceRate * 70 + lateRate * 20 + overtimeFactor * 10, 0, 100)
        );

        const anomalies = buildAnomalies({
          consistencyScore,
          lateRate,
          overtimeAverage,
          absenteeRisk,
        });

        const summary = summarizeUser({
          userName: user.name || 'Employee',
          windowDays,
          uniqueDays,
          consistencyScore,
          lateRate,
          latenessTrend,
          overtimeAverage,
          absenteeRisk,
        });

        const insight = {
          userId,
          userName: user.name || 'Employee',
          userEmail: user.email || null,
          department: user.department || 'Unassigned',
          windowStart,
          windowEnd,
          metrics: {
            consistencyScore,
            latenessTrend,
            overtimeAverage: Number(overtimeAverage.toFixed(2)),
            absenteeRisk,
          },
          stats: {
            lateRate: Number((lateRate * 100).toFixed(1)),
            attendanceDays: uniqueDays,
            totalDays: windowDays,
          },
          anomalies,
          summary,
          lastUpdated: new Date().toISOString(),
        };

        generatedInsights.push(insight);
      });

      setInsights(generatedInsights);

      addToast({
        type: 'success',
        title: 'Insights updated',
        message: 'Attendance insights have been recalculated.',
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      addToast({
        type: 'error',
        title: 'Insights failed',
        message: error.message || 'Failed to generate insights.',
      });
    } finally {
      setInsightsRunning(false);
    }
  };

  const insightsSorted = useMemo(() => {
    return [...insights].sort((a, b) => {
      const riskA = a.metrics?.absenteeRisk || 0;
      const riskB = b.metrics?.absenteeRisk || 0;
      return riskB - riskA;
    });
  }, [insights]);

  const insightAlerts = useMemo(() => {
    const alerts = [];
    insights.forEach((insight) => {
      (insight.anomalies || []).forEach((anomaly) => {
        alerts.push({
          ...anomaly,
          userName: insight.userName,
          department: insight.department,
        });
      });
    });
    return alerts.slice(0, 6);
  }, [insights]);

  const formatTrend = (trend) => {
    if (trend === 'improving') return 'Improving';
    if (trend === 'worsening') return 'Worsening';
    return 'Stable';
  };

  const filteredUsers = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    return users.filter((user) => {
      // Filter out deleted users (soft delete)
      if (user.isActive === false) return false;
      
      if (filters.department !== 'All' && user.department !== filters.department) return false;
      if (!searchTerm) return true;
      return (
        user.name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm)
      );
    });
  }, [users, filters]);

  const filteredUserIds = useMemo(() => {
    return new Set(
      filteredUsers
        .map((user) => user.uid || user.id || user.userId)
        .filter((value) => Boolean(value))
    );
  }, [filteredUsers]);

  const filteredAttendance = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    const hasScopedUsers = filters.department !== 'All' || searchTerm.length > 0;
    if (hasScopedUsers && filteredUserIds.size === 0) return [];

    return allAttendance.filter((record) => {
      if (filters.start && record.date < filters.start) return false;
      if (filters.end && record.date > filters.end) return false;
      if (filters.department !== 'All' && record.department !== filters.department) return false;
      if (searchTerm && !record.userName?.toLowerCase().includes(searchTerm)) return false;
      if (filteredUserIds.size > 0 && !filteredUserIds.has(record.userId)) return false;
      return true;
    });
  }, [allAttendance, filters, filteredUserIds]);

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return filteredAttendance.filter((record) => record.date === today);
  };

  const stats = useMemo(() => {
    const today = getTodayAttendance();
    const present = today.filter((r) => r.status === 'Present').length;
    const late = today.filter((r) => r.status === 'Late').length;
    const total = filteredUsers.length;
    const absent = Math.max(0, total - today.length);
    const safeTotal = total || 1;
    const lateRate = total === 0 ? 0 : (late / total) * 100;
    const absenteeRate = (absent / safeTotal) * 100;
    return { present, late, absent, total, lateRate, absenteeRate };
  }, [filteredAttendance, filteredUsers]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        key,
        label: date.toLocaleString('en-US', { month: 'short' }),
      });
    }

    const totalUsers = filteredUsers.length;
    return months.map((month) => {
      const records = filteredAttendance.filter((record) => record.date?.startsWith(month.key));
      const uniqueUsers = new Set(records.map((record) => record.userId || record.userName)).size;
      const rate = totalUsers === 0 ? 0 : (uniqueUsers / totalUsers) * 100;
      return { label: month.label, rate: Math.round(rate) };
    });
  }, [filteredAttendance, filteredUsers]);

  const departmentPalette = {
    Engineering: '#6366F1',
    Sales: '#22C55E',
    Support: '#F59E0B',
    HR: '#F97316',
    Ops: '#38BDF8',
    Unassigned: '#94A3B8',
  };

  const departmentData = useMemo(() => {
    const counts = filteredUsers.reduce((acc, user) => {
      const label = user.department || 'Unassigned';
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const total = filteredUsers.length || 1;
    const fallbackColors = ['#6366F1', '#22C55E', '#F59E0B', '#F97316', '#38BDF8'];
    return Object.entries(counts).map(([label, count], index) => ({
      label,
      value: Math.round((count / total) * 100),
      color: departmentPalette[label] || fallbackColors[index % fallbackColors.length],
    }));
  }, [filteredUsers]);

  const lateTrend = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7;
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - diffToMonday);

    const weeks = [];
    for (let i = 11; i >= 0; i -= 1) {
      const start = new Date(currentWeekStart);
      start.setDate(currentWeekStart.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      weeks.push({ start, end });
    }

    return weeks.map((week) =>
      filteredAttendance.filter((record) => {
        if (record.status !== 'Late') return false;
        const recordDate = toDateOnly(record.date);
        if (!recordDate) return false;
        return recordDate >= week.start && recordDate < week.end;
      }).length
    );
  }, [filteredAttendance]);

  const heatmap = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7;
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - diffToMonday);

    const weeks = [];
    for (let i = 4; i >= 0; i -= 1) {
      const start = new Date(currentWeekStart);
      start.setDate(currentWeekStart.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      weeks.push({ start, end });
    }

    const grid = weeks.map(() => Array(7).fill(0));
    filteredAttendance.forEach((record) => {
      const recordDate = toDateOnly(record.date);
      if (!recordDate) return;
      weeks.forEach((week, index) => {
        if (recordDate >= week.start && recordDate < week.end) {
          const dayIndex = (recordDate.getDay() + 6) % 7;
          grid[index][dayIndex] += 1;
        }
      });
    });

    const maxCount = Math.max(1, ...grid.flat());
    return grid.map((row) =>
      row.map((value) => Math.min(4, Math.round((value / maxCount) * 4)))
    );
  }, [filteredAttendance]);

  const maxLate = Math.max(...lateTrend, 1);
  const lateLine = useMemo(() => {
    const width = 280;
    const height = 90;
    const step = width / (lateTrend.length - 1);
    return lateTrend
      .map((value, index) => {
        const x = index * step;
        const y = height - (value / maxLate) * height;
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  }, [lateTrend, maxLate]);

  const absenteeAlert = stats.absenteeRate >= 8;
  const currentMonth = monthlyTrend[monthlyTrend.length - 1]?.rate || 0;
  const previousMonth = monthlyTrend[monthlyTrend.length - 2]?.rate || 0;
  const monthDelta = currentMonth - previousMonth;

  const departmentTotal = departmentData.reduce((sum, item) => sum + item.value, 0) || 1;
  const pieGradient = departmentData.length === 0
    ? '#1F2937 0% 100%'
    : departmentData.reduce(
        (acc, item) => {
          const start = acc.offset;
          const slice = (item.value / departmentTotal) * 100;
          const end = start + slice;
          return {
            offset: end,
            gradient: `${acc.gradient}${acc.gradient ? ', ' : ''}${item.color} ${start}% ${end}%`,
          };
        },
        { offset: 0, gradient: '' }
      ).gradient;

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#E5E7EB]">Admin Analytics</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#9CA3AF]">
              Management-level insights into attendance behavior
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-[#1F2937] dark:bg-[#111827] dark:text-[#9CA3AF] dark:hover:bg-[#1F2937]">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export Analytics
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            Filters
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 dark:text-[#9CA3AF]">
                Date range start
              </label>
              <div className="relative mt-2">
                <CalendarDaysIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={filters.start}
                  onChange={(event) => updateFilter('start', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 dark:text-[#9CA3AF]">
                Date range end
              </label>
              <div className="relative mt-2">
                <CalendarDaysIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={filters.end}
                  onChange={(event) => updateFilter('end', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 dark:text-[#9CA3AF]">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(event) => updateFilter('department', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]"
              >
                {['All', 'Engineering', 'Sales', 'Support', 'HR', 'Ops'].map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 dark:text-[#9CA3AF]">
                Employee search
              </label>
              <div className="relative mt-2">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Search by name"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Employees"
            value={stats.total}
            icon={<UserGroupIcon className="h-6 w-6" />}
            color="text-indigo-600"
          />
          <KPICard
            title="Present Today"
            value={stats.present}
            icon={<CheckCircleIcon className="h-6 w-6" />}
            color="text-emerald-600"
          />
          <KPICard
            title="Late %"
            value={`${stats.lateRate.toFixed(1)}%`}
            icon={<ClockIcon className="h-6 w-6" />}
            color="text-amber-600"
          />
          <KPICard
            title="Absentee Rate"
            value={`${stats.absenteeRate.toFixed(1)}%`}
            icon={<XCircleIcon className="h-6 w-6" />}
            color="text-rose-600"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827] lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Insights Engine</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">
                  Daily workforce intelligence based on attendance data
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runInsights}
                  disabled={insightsRunning}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {insightsRunning ? 'Running...' : 'Run Insights'}
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <SparklesIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            {insightsLoading ? (
              <div className="mt-6 text-sm text-slate-500 dark:text-[#9CA3AF]">Loading insights...</div>
            ) : insightsSorted.length === 0 ? (
              <div className="mt-6 text-sm text-slate-500 dark:text-[#9CA3AF]">No insights available yet.</div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {insightsSorted.slice(0, 4).map((insight) => (
                  <div
                    key={insight.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#1F2937] dark:bg-[#0B1220]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-[#E5E7EB]">
                          {insight.userName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#9CA3AF]">
                          {insight.department}
                        </p>
                      </div>
                      <div
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          insight.metrics?.absenteeRisk >= 70
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                            : insight.metrics?.absenteeRisk >= 40
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                        }`}
                      >
                        Risk {insight.metrics?.absenteeRisk ?? 0}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-[#9CA3AF]">
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-[#E5E7EB]">
                          {insight.metrics?.consistencyScore ?? 0}%
                        </div>
                        Consistency
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-[#E5E7EB]">
                          {formatTrend(insight.metrics?.latenessTrend)}
                        </div>
                        Lateness trend
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-[#E5E7EB]">
                          {insight.metrics?.overtimeAverage ?? 0}h
                        </div>
                        Avg overtime
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-[#E5E7EB]">
                          {insight.stats?.attendanceDays ?? 0}/{insight.stats?.totalDays ?? 30}
                        </div>
                        Days present
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-600 dark:text-[#9CA3AF]">
                      {insight.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Insight Alerts</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">Anomalies and trends</p>
              </div>
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
            </div>

            {insightAlerts.length === 0 ? (
              <div className="mt-6 text-sm text-slate-500 dark:text-[#9CA3AF]">No alerts detected.</div>
            ) : (
              <div className="mt-4 space-y-3">
                {insightAlerts.map((alert, index) => (
                  <div key={`${alert.type}-${index}`} className="rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      {alert.userName} · {alert.department}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-[#9CA3AF]">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Abnormal Absenteeism</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">
                  Threshold 8% for departments
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  absenteeAlert
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                }`}
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-3xl font-semibold text-slate-900 dark:text-[#E5E7EB]">
              {stats.absenteeRate.toFixed(1)}%
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-[#9CA3AF]">
              {absenteeAlert
                ? 'Higher than normal absenteeism detected in Engineering and Ops.'
                : 'Absenteeism within expected range across departments.'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Month-over-Month</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">
                  Attendance rate comparison
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <ArrowTrendingUpIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-slate-900 dark:text-[#E5E7EB]">
                {monthDelta >= 0 ? '+' : ''}{monthDelta.toFixed(1)}%
              </span>
              <span className="text-sm text-slate-500 dark:text-[#9CA3AF]">vs last month</span>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-[#9CA3AF]">
              Current month attendance rate is {currentMonth.toFixed(1)}%.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Monthly Attendance Trend</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">Rolling 6 months</p>
              </div>
              <ChartBarIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6 flex items-end gap-4">
              {monthlyTrend.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end rounded-lg bg-slate-50 px-2 dark:bg-[#0B1220]">
                    <div
                      className="w-full rounded-lg bg-indigo-500/80"
                      style={{ height: `${item.rate}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-[#9CA3AF]">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-slate-500 dark:text-[#9CA3AF]">Average attendance rate</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Department Distribution</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">Share of workforce</p>
              </div>
              <ChartPieIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div
                className="h-40 w-40 rounded-full"
                style={{ background: `conic-gradient(${pieGradient})` }}
              />
              <div className="space-y-3">
                {departmentData.map((dept) => (
                  <div key={dept.label} className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span className="text-sm text-slate-600 dark:text-[#9CA3AF]">{dept.label}</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-[#E5E7EB]">
                      {dept.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Late Arrivals Trend</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">Weekly average</p>
              </div>
              <ClockIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6">
              <svg viewBox="0 0 280 90" className="h-24 w-full">
                <path d={lateLine} fill="none" stroke="#6366F1" strokeWidth="3" />
              </svg>
              <div className="mt-4 flex justify-between text-xs text-slate-500 dark:text-[#9CA3AF]">
                {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'].map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Working Hours Heatmap</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">Intensity by weekday</p>
              </div>
              <ChartBarIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6 space-y-2">
              <div className="grid grid-cols-7 gap-2 text-xs text-slate-500 dark:text-[#9CA3AF]">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <span key={day} className="text-center">
                    {day}
                  </span>
                ))}
              </div>
              <div className="grid gap-2">
                {heatmap.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-7 gap-2">
                    {row.map((value, colIndex) => {
                      const intensityMap = [
                        'bg-slate-100 dark:bg-[#1F2937]',
                        'bg-indigo-100 dark:bg-indigo-500/20',
                        'bg-indigo-200 dark:bg-indigo-500/40',
                        'bg-indigo-300 dark:bg-indigo-500/60',
                        'bg-indigo-400 dark:bg-indigo-500/80',
                      ];
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`h-8 rounded-md ${intensityMap[value]}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-[#1F2937]">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Recent Attendance</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">Latest check-ins based on filters</p>
              </div>
              <div className="text-xs font-semibold uppercase text-slate-400">Live</div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-14 text-sm text-slate-500 dark:text-[#9CA3AF]">
                Loading attendance...
              </div>
            ) : filteredAttendance.length === 0 ? (
              <div className="flex items-center justify-center py-14 text-sm text-slate-500 dark:text-[#9CA3AF]">
                No attendance records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-[#1F2937]">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-[#0B1220] dark:text-[#9CA3AF]">
                    <tr>
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Check-In</th>
                      <th className="px-6 py-3">Check-Out</th>
                      <th className="px-6 py-3">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#1F2937]">
                    {filteredAttendance.slice(0, 8).map((record) => (
                      <tr key={record.id} className="odd:bg-white even:bg-slate-50 dark:odd:bg-[#111827] dark:even:bg-[#0F172A]">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-[#E5E7EB]">
                          {record.userName}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-[#9CA3AF]">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-[#9CA3AF]">
                          {formatTime(record.checkIn)}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-[#9CA3AF]">
                          {record.checkOut ? formatTime(record.checkOut) : 'Not checked out'}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-[#E5E7EB]">
                          {calculateWorkHours(record.checkIn, record.checkOut)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-[#1F2937]">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Employee Directory</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">Filtered user list</p>
              </div>
              <div className="text-xs font-semibold uppercase text-slate-400">Live</div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-14 text-sm text-slate-500 dark:text-[#9CA3AF]">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-14 text-sm text-slate-500 dark:text-[#9CA3AF]">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-[#1F2937]">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-[#0B1220] dark:text-[#9CA3AF]">
                    <tr>
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#1F2937]">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="odd:bg-white even:bg-slate-50 dark:odd:bg-[#111827] dark:even:bg-[#0F172A]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-[#6366F1]">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="font-medium text-slate-900 dark:text-[#E5E7EB]">{user.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-[#9CA3AF]">{user.email}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-[#9CA3AF]">{user.department || 'Not set'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                          }`}>
                            {user.role || 'employee'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                              title="Edit user"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                              title="Delete user"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Leave Management Section */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-[#1F2937]">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Leave Requests</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">
                  Manage employee leave applications
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  {leaves.filter((l) => l.status === 'pending').length} Pending
                </span>
              </div>
            </div>
            {leaves.length === 0 ? (
              <div className="flex items-center justify-center py-14 text-sm text-slate-500 dark:text-[#9CA3AF]">
                No leave requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-[#1F2937]">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-[#0B1220] dark:text-[#9CA3AF]">
                    <tr>
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3">Leave Period</th>
                      <th className="px-6 py-3">Days</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Submitted</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#1F2937]">
                    {leaves.map((leave) => {
                      const startDate = new Date(leave.startDate);
                      const endDate = new Date(leave.endDate);
                      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                      
                      return (
                        <tr
                          key={leave.id}
                          className="cursor-pointer odd:bg-white even:bg-slate-50 hover:bg-indigo-50 dark:odd:bg-[#111827] dark:even:bg-[#0F172A] dark:hover:bg-indigo-500/5"
                          onClick={() => handleReviewLeave(leave)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-[#6366F1]">
                                {leave.userName?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-[#E5E7EB]">
                                  {leave.userName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-[#9CA3AF]">
                                  {leave.userEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-[#9CA3AF]">
                            <div className="text-sm">
                              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                              {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-[#9CA3AF]">
                            {days} {days === 1 ? 'day' : 'days'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                leave.status === 'approved'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                                  : leave.status === 'declined'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                              }`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-[#9CA3AF]">
                            {new Date(leave.submittedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReviewLeave(leave);
                              }}
                              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <EditUserModal
          open={editUserModal}
          onClose={() => {
            setEditUserModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSave={handleSaveUser}
        />

        <LeaveReviewModal
          open={leaveReviewModal}
          onClose={() => {
            setLeaveReviewModal(false);
            setSelectedLeave(null);
          }}
          leave={selectedLeave}
          onApprove={handleApproveLeave}
          onDecline={handleDeclineLeave}
        />

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-[#1F2937] dark:bg-[#111827] dark:text-[#9CA3AF]">
            Syncing analytics data...
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
