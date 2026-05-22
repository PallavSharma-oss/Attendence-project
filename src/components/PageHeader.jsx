// src/components/PageHeader.jsx
const PageHeader = ({ title, subtitle, actionButton }) => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#E5E7EB]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-[#9CA3AF]">{subtitle}</p>}
      </div>
      {actionButton && actionButton}
    </div>
  );
};

export default PageHeader;
