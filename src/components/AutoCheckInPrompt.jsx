import { useState } from 'react';
import { WifiIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const AutoCheckInPrompt = ({ onConfirm, onDismiss, ipAddress }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 animate-slide-up">
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl dark:border-emerald-500/30 dark:bg-[#111827]">
        {/* Header */}
        <div className="flex items-start justify-between bg-linear-to-r from-emerald-50 to-green-50 px-4 py-3 dark:from-emerald-500/10 dark:to-green-500/10">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
              <WifiIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                Office Network Detected
              </h3>
              <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                Auto check-in is available
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 px-4 py-4">
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-medium">Verified office location</div>
              <div className="mt-0.5 opacity-75">IP: {ipAddress}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Checking in...' : 'Confirm Auto Check-In'}
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-[#1F2937] dark:text-[#9CA3AF] dark:hover:bg-[#1F2937]"
          >
            Not Now
          </button>

          <p className="text-center text-xs text-slate-500 dark:text-[#9CA3AF]">
            This feature only works when connected to the office network
          </p>
        </div>
      </div>
    </div>
  );
};

export default AutoCheckInPrompt;
