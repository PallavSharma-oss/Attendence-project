// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../hooks/useAttendance';
import { useAdmin } from '../hooks/useAdmin';
import { getNetworkWhitelist } from '../services/networkService';
import Layout from '../components/Layout';
import KPICard from '../components/KPICard';
import LeaveModal from '../components/LeaveModal';
import FaceCheckInModal from '../components/FaceCheckInModal';
import AutoCheckInPrompt from '../components/AutoCheckInPrompt';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { validateOfficeNetwork } from '../utils/networkDetection';

const Dashboard = () => {
  const { user, userDetails } = useAuth();
  const navigate = useNavigate();
  const { todayAttendance, checkIn, checkOut, loading, attendanceHistory, fetchAttendanceHistory } = useAttendance();
  const { submitLeaveRequest } = useAdmin();
  const { addToast } = useToast();
  const [workingHours, setWorkingHours] = useState(0);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [showAutoCheckIn, setShowAutoCheckIn] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  // Check for office network on mount
  useEffect(() => {
    const checkOfficeNetwork = async () => {
      // Only check if user hasn't checked in yet today
      if (todayAttendance) return;

      try {
        // Fetch network whitelist from API
        const result = await getNetworkWhitelist();
        
        if (!result.success || !result.data || result.data.length === 0) {
          console.log('Network whitelist not configured');
          return;
        }

        const allowedRanges = result.data.map(item => item.ipRange);
        
        if (allowedRanges.length === 0) {
          console.log('Auto check-in disabled or no ranges configured');
          return;
        }

        // Validate office network
        const { isOfficeNetwork, ipAddress } = await validateOfficeNetwork(allowedRanges);
        
        if (isOfficeNetwork) {
          setNetworkInfo({ ipAddress, networkVerified: true });
          
          // Check if user dismissed auto check-in today
          const dismissKey = `autoCheckInDismissed_${new Date().toISOString().split('T')[0]}`;
          const wasDismissed = sessionStorage.getItem(dismissKey);
          
          if (!wasDismissed) {
            setShowAutoCheckIn(true);
          }
        }
      } catch (error) {
        console.error('Failed to check office network:', error);
      }
    };

    checkOfficeNetwork();
  }, [todayAttendance]);

  useEffect(() => {
    if (todayAttendance?.checkIn) {
      const interval = setInterval(() => {
        const start = new Date(todayAttendance.checkIn);
        const now = todayAttendance.checkOut ? new Date(todayAttendance.checkOut) : new Date();
        const hours = Math.abs(now - start) / 36e5;
        setWorkingHours(hours);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [todayAttendance]);

  const handleCheckIn = () => {
    setFaceModalOpen(true);
  };

  const handleFaceVerified = async ({ matchScore }) => {
    const result = await checkIn({ matchScore });
    setFaceModalOpen(false);

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Checked in successfully',
        message: 'Have a productive day!',
      });
    } else {
      addToast({
        type: 'error',
        title: 'Check-in failed',
        message: result.error,
      });
    }
  };

  const handleAutoCheckIn = async () => {
    try {
      const result = await checkIn(null, networkInfo);

      if (result.success) {
        setShowAutoCheckIn(false);
        addToast({
          type: 'success',
          title: 'Auto check-in successful',
          message: `Checked in from office network (${networkInfo.ipAddress})`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Auto check-in failed',
          message: result.error,
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Auto check-in failed',
        message: error.message,
      });
    }
  };

  const handleDismissAutoCheckIn = () => {
    setShowAutoCheckIn(false);
    // Store dismissal in sessionStorage to prevent showing again today
    const dismissKey = `autoCheckInDismissed_${new Date().toISOString().split('T')[0]}`;
    sessionStorage.setItem(dismissKey, 'true');
  };

  const handleCheckOut = async () => {
    const result = await checkOut();

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Checked out successfully',
        message: 'See you tomorrow!',
      });
    } else {
      addToast({
        type: 'error',
        title: 'Check-out failed',
        message: result.error,
      });
    }
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

  const getMonthlyStats = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyRecords = attendanceHistory.filter(r => r.date.startsWith(currentMonth));
    const presentDays = monthlyRecords.filter(r => r.status === 'Present').length;
    const lateDays = monthlyRecords.filter(r => r.status === 'Late').length;
    return { total: monthlyRecords.length, present: presentDays, late: lateDays };
  };

  const monthlyStats = getMonthlyStats();
  const attendanceRate = monthlyStats.total > 0
    ? Math.round(((monthlyStats.present + monthlyStats.late) / monthlyStats.total) * 100)
    : 0;
  const progressClass = attendanceRate >= 75
    ? 'w-3/4'
    : attendanceRate >= 50
    ? 'w-1/2'
    : attendanceRate >= 25
    ? 'w-1/4'
    : attendanceRate > 0
    ? 'w-1/6'
    : 'w-0';

  const handleLeaveChange = (event) => {
    setLeaveForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleLeaveSubmit = async (event) => {
    event.preventDefault();
    
    const result = await submitLeaveRequest(
      user.uid,
      userDetails?.name || 'Unknown',
      userDetails?.email || user.email,
      leaveForm
    );
    
    setLeaveOpen(false);
    setLeaveForm({ startDate: '', endDate: '', reason: '' });
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Leave request submitted',
        message: 'Your manager will review it shortly.',
      });
    } else {
      addToast({
        type: 'error',
        title: 'Failed to submit leave request',
        message: result.error || 'Please try again.',
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#E5E7EB]">
            Welcome back, {userDetails?.name}!
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#9CA3AF]">
            Here's your attendance overview for today
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-indigo-600 to-indigo-400 p-6 text-white shadow-md">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {todayAttendance ? 'Your Attendance Today' : 'Ready to Check In?'}
                    </h2>
                    <p className="mt-1 text-sm text-white/80">
                      {todayAttendance ? 'Great job! Keep up the good work' : 'Mark your presence for today'}
                    </p>
                  </div>
                  {todayAttendance && (
                    <div className="rounded-lg bg-white/15 px-3 py-1">
                      <StatusBadge status={todayAttendance.status} size="small" />
                    </div>
                  )}
                </div>

                {todayAttendance ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-white/15 p-3">
                      <div className="text-xs text-white/80">Check-In</div>
                      <div className="mt-1 text-lg font-semibold">{formatTime(todayAttendance.checkIn)}</div>
                    </div>
                    <div className="rounded-lg bg-white/15 p-3">
                      <div className="text-xs text-white/80">Check-Out</div>
                      <div className="mt-1 text-lg font-semibold">
                        {todayAttendance.checkOut ? formatTime(todayAttendance.checkOut) : '--:--'}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/15 p-3">
                      <div className="text-xs text-white/80">Working Hours</div>
                      <div className="mt-1 text-lg font-semibold">{workingHours.toFixed(1)}h</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-white/10 py-6 text-center">
                    <ClockIcon className="h-10 w-10 text-white/70" />
                    <p className="mt-2 text-sm text-white/80">You haven't checked in today yet</p>
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleCheckIn}
                    disabled={loading || todayAttendance !== null}
                    className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Check In
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckOut}
                    disabled={loading || !todayAttendance || todayAttendance.checkOut}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/40 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/50"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Check Out
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
                  <span>Check-in before 9:30 AM to avoid being marked as Late</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/face-enroll')}
                      className="flex items-center gap-1 rounded-lg border border-white/40 px-3 py-1 font-semibold text-white hover:bg-white/10"
                    >
                      <FaceSmileIcon className="h-4 w-4" />
                      Re-enroll Face
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaveOpen(true)}
                      className="rounded-lg border border-white/40 px-3 py-1 font-semibold text-white hover:bg-white/10"
                    >
                      Apply for Leave
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-[#6366F1]">
                <CalendarDaysIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-[#E5E7EB]">This Month</div>
                <div className="text-xs text-slate-500 dark:text-[#9CA3AF]">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#9CA3AF]">
                <span>Attendance Rate</span>
                <span className="font-semibold text-slate-900 dark:text-[#E5E7EB]">{attendanceRate}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-[#1F2937]">
                <div className={`h-2 rounded-full bg-emerald-400 ${progressClass}`} />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-[#9CA3AF]">Present</span>
                <span className="font-semibold text-slate-900 dark:text-[#E5E7EB]">{monthlyStats.present}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-[#9CA3AF]">Late</span>
                <span className="font-semibold text-slate-900 dark:text-[#E5E7EB]">{monthlyStats.late}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-[#9CA3AF]">Total Days</span>
                <span className="font-semibold text-slate-900 dark:text-[#E5E7EB]">{monthlyStats.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Working Days"
            value={monthlyStats.total}
            icon={<CalendarDaysIcon className="h-6 w-6" />}
            color="text-indigo-600"
            subtitle="This month"
          />
          <KPICard
            title="Present Days"
            value={monthlyStats.present}
            icon={<CheckCircleIcon className="h-6 w-6" />}
            color="text-emerald-600"
            subtitle="On time arrivals"
          />
          <KPICard
            title="Late Days"
            value={monthlyStats.late}
            icon={<ClockIcon className="h-6 w-6" />}
            color="text-amber-600"
            subtitle="After 9:30 AM"
          />
          <KPICard
            title="Avg. Hours/Day"
            value={workingHours > 0 ? workingHours.toFixed(1) : '0'}
            icon={<ChartBarIcon className="h-6 w-6" />}
            color="text-sky-600"
            subtitle="Today's progress"
          />
        </div>
      </div>

      <LeaveModal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        formData={leaveForm}
        onChange={handleLeaveChange}
        onSubmit={handleLeaveSubmit}
      />
      <FaceCheckInModal
        open={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        userId={user?.uid}
        onVerified={handleFaceVerified}
      />
      {showAutoCheckIn && networkInfo && (
        <AutoCheckInPrompt
          ipAddress={networkInfo.ipAddress}
          onConfirm={handleAutoCheckIn}
          onDismiss={handleDismissAutoCheckIn}
        />
      )}
    </Layout>
  );
};

export default Dashboard;
