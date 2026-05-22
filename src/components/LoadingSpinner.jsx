// src/components/LoadingSpinner.jsx
const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-[#1F2937] dark:border-t-[#6366F1] ${
          sizeClasses[size] || sizeClasses.md
        }`}
      />
      {message && <div className="text-sm text-slate-500 dark:text-[#9CA3AF]">{message}</div>}
    </div>
  );
};

export default LoadingSpinner;
