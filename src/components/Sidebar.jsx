// src/components/Sidebar.jsx
import { Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  ChevronLeftIcon,
  ClockIcon,
  HomeIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileOpen, onMobileClose, collapsed, onToggleCollapse }) => {
  const { userDetails } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', icon: HomeIcon, path: '/dashboard', role: 'all' },
    { title: 'History', icon: ClipboardDocumentCheckIcon, path: '/history', role: 'all' },
    { title: 'My Leaves', icon: CalendarDaysIcon, path: '/leaves', role: 'all' },
    { title: '🧠 Presence Intelligence', icon: SparklesIcon, path: '/presence-intelligence', roles: ['admin', 'hr'] },
    { title: 'Admin Panel', icon: ShieldCheckIcon, path: '/admin', role: 'admin' },
  ];

  const filteredItems = menuItems.filter((item) => {
    if (item.role === 'all') return true;
    if (item.roles) return item.roles.includes(userDetails?.role);
    return userDetails?.role === item.role;
  });

  const isActive = (path) => location.pathname === path;

  const SidebarContent = ({ isMobile }) => (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-indigo-400">
            <ClockIcon className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-base font-semibold leading-tight">TimeTrack</div>
              <div className="text-xs text-slate-300">Attendance System</div>
            </div>
          )}
        </div>
        {!isMobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800"
          >
            {collapsed ? <Bars3Icon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
          </button>
        )}
      </div>

      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
            {userDetails?.name?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{userDetails?.name}</div>
              <div className="truncate text-xs text-slate-300">{userDetails?.department}</div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        {filteredItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                navigate(item.path);
                if (isMobile) onMobileClose();
              }}
              className={`group mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-300'}`} />
              {!collapsed && <span>{item.title}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-white/10 px-4 py-3 text-xs text-slate-400">
          © 2026 TimeTrack
        </div>
      )}
    </div>
  );

  return (
    <>
      <Transition.Root show={mobileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onMobileClose}>
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

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-200 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-64 flex-col">
                <button
                  type="button"
                  className="absolute -right-10 top-4 rounded-lg bg-white/10 p-2 text-white"
                  onClick={onMobileClose}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <SidebarContent isMobile />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } transition-all duration-200`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
