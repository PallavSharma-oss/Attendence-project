// src/components/Layout.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-[#0B1220]">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />
      <div className={`flex min-h-screen flex-col ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Topbar onMenuClick={() => setMobileOpen(true)} collapsed={collapsed} />
        <main className="flex-1 px-4 pb-10 pt-24 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
