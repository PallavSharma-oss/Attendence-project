import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const LeaveReviewModal = ({ open, onClose, leave, onApprove, onDecline }) => {
  const [comments, setComments] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    await onApprove(leave.id, comments);
    setIsApproving(false);
    setComments('');
    onClose();
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    await onDecline(leave.id, comments);
    setIsDeclining(false);
    setComments('');
    onClose();
  };

  if (!leave) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
      case 'declined':
        return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
    }
  };

  const calculateDays = () => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <Dialog.Panel className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-md dark:border-[#1F2937] dark:bg-[#111827]">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-[#E5E7EB]">
                  Review Leave Request
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-[#1F2937]"
                >
                  <XMarkIcon className="h-5 w-5 text-slate-500 dark:text-[#9CA3AF]" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                      leave.status
                    )}`}
                  >
                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-[#9CA3AF]">
                    {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                  </span>
                </div>

                {/* Employee Info */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#1F2937] dark:bg-[#0B1220]">
                  <div className="flex items-start gap-3">
                    <UserIcon className="h-5 w-5 text-slate-400 dark:text-[#9CA3AF]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-[#E5E7EB]">
                        {leave.userName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-[#9CA3AF]">
                        {leave.userEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Leave Dates */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#1F2937] dark:bg-[#0B1220]">
                  <div className="flex items-start gap-3">
                    <CalendarDaysIcon className="h-5 w-5 text-slate-400 dark:text-[#9CA3AF]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-[#E5E7EB]">
                        Leave Period
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-[#9CA3AF]">
                        From: {formatDate(leave.startDate)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-[#9CA3AF]">
                        To: {formatDate(leave.endDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-[#E5E7EB]">
                    Reason
                  </label>
                  <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]">
                    {leave.reason}
                  </div>
                </div>

                {/* Submitted At */}
                <p className="text-xs text-slate-500 dark:text-[#9CA3AF]">
                  Submitted on {formatDate(leave.submittedAt)}
                </p>

                {/* Existing Review (if already reviewed) */}
                {leave.status !== 'pending' && leave.reviewerName && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-[#1F2937] dark:bg-[#0B1220]">
                    <p className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF]">
                      Reviewed by {leave.reviewerName} on {formatDate(leave.reviewedAt)}
                    </p>
                    {leave.comments && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-[#E5E7EB]">
                        {leave.comments}
                      </p>
                    )}
                  </div>
                )}

                {/* Comments (for pending requests) */}
                {leave.status === 'pending' && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-[#E5E7EB]">
                      Comments (Optional)
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                      placeholder="Add comments for the employee..."
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {leave.status === 'pending' ? (
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleDecline}
                      disabled={isDeclining || isApproving}
                      className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      {isDeclining ? 'Declining...' : 'Decline'}
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={isDeclining || isApproving}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      {isApproving ? 'Approving...' : 'Approve'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#1F2937] dark:text-[#9CA3AF] dark:hover:bg-[#1F2937]"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default LeaveReviewModal;
