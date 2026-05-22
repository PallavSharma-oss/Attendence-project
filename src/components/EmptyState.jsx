// src/components/EmptyState.jsx
const EmptyState = ({
  icon: Icon,
  title = 'No data found',
  description = 'There is nothing to display here',
  iconSize = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      {Icon && (
        <Icon className={`mb-3 text-slate-300 dark:text-slate-600 ${sizeClasses[iconSize] || sizeClasses.md}`} />
      )}
      <div className="text-sm font-semibold text-slate-600 dark:text-[#E5E7EB]">{title}</div>
      <div className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">{description}</div>
    </div>
  );
};

export default EmptyState;
