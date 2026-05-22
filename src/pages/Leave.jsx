// src/pages/Leave.jsx
import { useEffect, useState } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { useToast } from '../components/ToastProvider';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';

const Leave = () => {
  const { user } = useAuth();
  const { fetchUserLeaveRequests, deleteLeaveRequest, loading } = useAdmin();
  const { addToast } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, approved, declined
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const loadLeaves = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setFetchError(null);
      console.log('Fetching leaves for user:', user.uid);
      try {
        const data = await fetchUserLeaveRequests(user.uid);
        console.log('Fetched leaves:', data);
        setLeaves(data);
      } catch (error) {
        console.error('Error loading leaves:', error);
        setFetchError(error.message);
        addToast('Failed to load leave requests: ' + error.message, 'error');
      }
      setIsLoading(false);
    };

    loadLeaves();
  }, [user?.uid]);

  const loadLeaves = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchUserLeaveRequests(user.uid);
      setLeaves(data);
    } catch (error) {
      console.error('Error loading leaves:', error);
      setFetchError(error.message);
      addToast('Failed to load leave requests: ' + error.message, 'error');
    }
    setIsLoading(false);
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (filter === 'all') return true;
    return leave.status === filter;
  });

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = async (leaveId) => {
    const result = await deleteLeaveRequest(leaveId);
    if (result.success) {
      addToast('Leave request deleted successfully', 'success');
      setDeleteConfirm(null);
      loadLeaves();
    } else {
      addToast(`Failed to delete - ${result.error}`, 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'declined':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ExclamationCircleIcon className="h-5 w-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    declined: leaves.filter((l) => l.status === 'declined').length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Leave Requests</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            View and manage your leave request history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Requests</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <CalendarDaysIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</p>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <ClockIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Approved</p>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Declined</p>
                <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">{stats.declined}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'declined', label: 'Declined' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition ${
                  filter === tab.key
                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Leave Requests List */}
        <div className="space-y-4">
          {fetchError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">
                <strong>Error:</strong> {fetchError}
              </p>
              <p className="mt-2 text-xs text-red-500 dark:text-red-400">
                Make sure you have published the Firestore security rules. Check the browser console for details.
              </p>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No leave requests</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {filter === 'all'
                  ? "You haven't submitted any leave requests yet."
                  : `No ${filter} leave requests found.`}
              </p>
            </div>
          ) : (
            filteredLeaves.map((leave) => (
              <div
                key={leave.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(leave.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </h3>
                          <StatusBadge status={leave.status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {calculateDays(leave.startDate, leave.endDate)} day(s)
                        </p>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mt-4 flex items-start gap-2">
                      <DocumentTextIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Reason:</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{leave.reason}</p>
                      </div>
                    </div>

                    {/* Submitted Date */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <ClockIcon className="h-4 w-4" />
                      <span>Submitted on {formatDate(leave.submittedAt)}</span>
                    </div>

                    {/* Reviewer Info (if reviewed) */}
                    {leave.reviewerName && (
                      <div className="mt-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
                        <div className="flex items-center gap-2">
                          <UserCircleIcon className="h-5 w-5 text-slate-400" />
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Reviewed by {leave.reviewerName}
                          </p>
                        </div>
                        {leave.comments && (
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="font-medium">Comments:</span> {leave.comments}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          on {formatDate(leave.reviewedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Delete Button (only for pending) */}
                  {leave.status === 'pending' && (
                    <div>
                      {deleteConfirm === leave.id ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-slate-600 dark:text-slate-400">Confirm delete?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(leave.id)}
                              className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(leave.id)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          title="Cancel request"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Leave;
