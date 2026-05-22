import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { useToast } from '../components/ToastProvider';
import { getAllAttendance } from '../services/attendanceService';

const PresenceHeatmap = lazy(() => import('../components/presence/PresenceHeatmap'));
const ArrivalDistributionChart = lazy(() => import('../components/presence/ArrivalDistributionChart'));
const WeeklyRhythmChart = lazy(() => import('../components/presence/WeeklyRhythmChart'));

const PresenceIntelligence = () => {
  const { addToast } = useToast();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const dateToYMD = (date) => date.toISOString().split('T')[0];

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const hours = Math.abs(end - start) / 36e5;
    return Number.isFinite(hours) ? hours : 0;
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 29);
      const windowStart = dateToYMD(startDate);
      const windowEnd = dateToYMD(endDate);

      // Fetch attendance data from API
      const result = await getAllAttendance({
        startDate: windowStart,
        endDate: windowEnd
      });

      if (result.success) {
        const processedMetrics = calculateMetrics(result.data);
        setMetrics(processedMetrics);
      }
    } catch (error) {
      console.error('Error fetching presence metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (records) => {
    const recordsByDate = new Map();
    records.forEach((record) => {
      if (!record.date) return;
      if (!recordsByDate.has(record.date)) {
        recordsByDate.set(record.date, []);
      }
      recordsByDate.get(record.date).push(record);
    });

    const dailyMetrics = [];

    recordsByDate.forEach((dayRecords, date) => {
      const hourlyPresence = Array.from({ length: 24 }, () => 0);
      const arrivalDistribution = Array.from({ length: 24 }, () => 0);
      const checkInHours = [];

      dayRecords.forEach((record) => {
        const checkIn = record.checkIn ? new Date(record.checkIn) : null;
        const checkOut = record.checkOut ? new Date(record.checkOut) : null;
        if (checkIn) {
          const hour = checkIn.getHours();
          arrivalDistribution[hour] += 1;
          checkInHours.push(hour + checkIn.getMinutes() / 60);
        }

        const fallbackOut = checkIn ? new Date(checkIn.getTime() + 8 * 60 * 60 * 1000) : null;
        const end = checkOut || fallbackOut;
        if (checkIn && end) {
          const startHour = checkIn.getHours();
          const endHour = Math.min(23, end.getHours());
          for (let h = startHour; h <= endHour; h += 1) {
            hourlyPresence[h] += 1;
          }
        }
      });

      const peakHour = hourlyPresence.indexOf(Math.max(...hourlyPresence));
      const totalEmployees = new Set(dayRecords.map((r) => r.userId)).size || 1;

      const avgPresence = hourlyPresence.reduce((sum, value) => sum + value, 0) / 24;
      const collaborationDensity = clamp((avgPresence / totalEmployees) * 100, 0, 100);

      const mean = checkInHours.length
        ? checkInHours.reduce((sum, value) => sum + value, 0) / checkInHours.length
        : 0;
      const variance = checkInHours.length
        ? checkInHours.reduce((sum, value) => sum + (value - mean) ** 2, 0) / checkInHours.length
        : 0;
      const stddev = Math.sqrt(variance);
      const rhythmScore = Math.round(clamp(100 - stddev * 15, 0, 100));

      dailyMetrics.push({
        date,
        peakPresenceTime: `${String(peakHour).padStart(2, '0')}:00`,
        rhythmScore,
        collaborationDensity: Number(collaborationDensity.toFixed(1)),
        anomalyDetected: false,
        attendanceCount: dayRecords.length,
        totalEmployees,
        hourlyPresence,
        arrivalDistribution,
      });
    });

    const dailyCounts = dailyMetrics.map((metric) => metric.attendanceCount);
    const meanCount = dailyCounts.length
      ? dailyCounts.reduce((sum, value) => sum + value, 0) / dailyCounts.length
      : 0;
    const varianceCount = dailyCounts.length
      ? dailyCounts.reduce((sum, value) => sum + (value - meanCount) ** 2, 0) / dailyCounts.length
      : 0;
    const stddevCount = Math.sqrt(varianceCount);

    // Add anomaly detection to metrics
    dailyMetrics.forEach((metric) => {
      const anomalyDetected = metric.attendanceCount < meanCount - 2 * stddevCount;
      metric.anomalyDetected = anomalyDetected;
      metric.generatedAt = new Date().toISOString();
    });

    return dailyMetrics;
  };

  const runPresenceMetrics = async () => {
    try {
      setRunning(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 29);

      const windowStart = dateToYMD(startDate);
      const windowEnd = dateToYMD(endDate);

      // Fetch attendance data from API
      const result = await getAllAttendance({
        startDate: windowStart,
        endDate: windowEnd
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch attendance');
      }

      // Calculate and store metrics
      const dailyMetrics = calculateMetrics(result.data);
      setMetrics(dailyMetrics);

      addToast({
        type: 'success',
        title: 'Presence metrics updated',
        message: 'Presence Intelligence metrics have been generated.',
      });
    } catch (error) {
      console.error('Error generating presence metrics:', error);
      addToast({
        type: 'error',
        title: 'Generation failed',
        message: error.message || 'Unable to generate metrics.',
      });
    } finally {
      setRunning(false);
    }
  };

  const aggregatedHourly = useMemo(() => {
    const totals = Array.from({ length: 24 }, () => 0);
    metrics.forEach((metric) => {
      (metric.hourlyPresence || []).forEach((value, index) => {
        totals[index] += value;
      });
    });
    return totals.map((value) => (metrics.length ? Math.round(value / metrics.length) : 0));
  }, [metrics]);

  const aggregatedArrivals = useMemo(() => {
    const totals = Array.from({ length: 24 }, () => 0);
    metrics.forEach((metric) => {
      (metric.arrivalDistribution || []).forEach((value, index) => {
        totals[index] += value;
      });
    });
    return totals;
  }, [metrics]);

  const weeklyRhythm = useMemo(() => {
    const weeks = [];
    const weekCount = 4;
    for (let i = 0; i < weekCount; i += 1) {
      const start = new Date();
      start.setDate(start.getDate() - (i * 7 + 6));
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const startStr = dateToYMD(start);
      const endStr = dateToYMD(end);
      const weekMetrics = metrics.filter(
        (metric) => metric.date >= startStr && metric.date <= endStr
      );
      const avgScore = weekMetrics.length
        ? Math.round(
            weekMetrics.reduce((sum, value) => sum + (value.rhythmScore || 0), 0) / weekMetrics.length
          )
        : 0;
      weeks.push({ label: `W${weekCount - i}`, score: avgScore });
    }
    return weeks.reverse();
  }, [metrics]);

  const kpi = useMemo(() => {
    if (metrics.length === 0) {
      return {
        peakPresenceTime: '--:--',
        rhythmScore: 0,
        collaborationDensity: 0,
        anomalies: 0,
      };
    }

    const peakMap = new Map();
    metrics.forEach((metric) => {
      const key = metric.peakPresenceTime || '--:--';
      peakMap.set(key, (peakMap.get(key) || 0) + 1);
    });
    let peakPresenceTime = '--:--';
    let peakCount = 0;
    peakMap.forEach((count, key) => {
      if (count > peakCount) {
        peakPresenceTime = key;
        peakCount = count;
      }
    });

    const rhythmScore = Math.round(
      metrics.reduce((sum, value) => sum + (value.rhythmScore || 0), 0) / metrics.length
    );

    const collaborationDensity = Math.round(
      metrics.reduce((sum, value) => sum + (value.collaborationDensity || 0), 0) / metrics.length
    );

    const anomalies = metrics.filter((metric) => metric.anomalyDetected).length;

    return {
      peakPresenceTime,
      rhythmScore,
      collaborationDensity,
      anomalies,
    };
  }, [metrics]);

  const anomalyDays = useMemo(() => {
    return metrics.filter((metric) => metric.anomalyDetected).slice(-5).reverse();
  }, [metrics]);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Workforce Presence Intelligence
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Temporal behavior analytics based on attendance patterns
            </p>
          </div>
          <button
            type="button"
            onClick={runPresenceMetrics}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <SparklesIcon className="h-4 w-4" />
            {running ? 'Generating...' : 'Generate Metrics'}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Peak Presence Time</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {kpi.peakPresenceTime}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/10">
                <ClockIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Rhythm Stability Score</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {kpi.rhythmScore}%
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/10">
                <ChartBarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Collaboration Density</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {kpi.collaborationDensity}%
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/10">
                <UserGroupIcon className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Anomaly Detection</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {kpi.anomalies}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-500/10">
                <ExclamationTriangleIcon className="h-5 w-5 text-rose-600 dark:text-rose-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827] lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Time Heatmap</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">
                  Average hourly presence across the last 30 days
                </p>
              </div>
              <SparklesIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6">
              <Suspense fallback={<div className="text-sm text-slate-500">Loading heatmap...</div>}>
                <PresenceHeatmap hourlyPresence={aggregatedHourly} />
              </Suspense>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Anomaly Alerts</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">Unusual attendance days</p>
              </div>
              <ExclamationTriangleIcon className="h-5 w-5 text-rose-400" />
            </div>
            <div className="mt-4 space-y-3">
              {anomalyDays.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No anomalies detected.</p>
              ) : (
                anomalyDays.map((day) => (
                  <div key={day.date} className="rounded-lg bg-rose-50 p-3 dark:bg-rose-500/10">
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                      {day.date} flagged
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      Attendance dipped below expected range.
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Daily Arrival Distribution</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">
                  Aggregated arrival counts by hour
                </p>
              </div>
              <ChartBarIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6">
              <Suspense fallback={<div className="text-sm text-slate-500">Loading chart...</div>}>
                <ArrivalDistributionChart arrivals={aggregatedArrivals} />
              </Suspense>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">Weekly Rhythm Trend</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">
                  Average rhythm stability (last 4 weeks)
                </p>
              </div>
              <ChartBarIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6">
              <Suspense fallback={<div className="text-sm text-slate-500">Loading trend...</div>}>
                <WeeklyRhythmChart weeks={weeklyRhythm} />
              </Suspense>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-[#1F2937] dark:bg-[#111827] dark:text-slate-400">
            Loading presence metrics...
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PresenceIntelligence;
