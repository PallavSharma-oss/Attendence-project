// src/components/Topbar.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  FaceSmileIcon,
  MoonIcon,
  PowerIcon,
  SunIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Topbar = ({ onMenuClick }) => {
  const { userDetails, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur transition-colors duration-200 dark:border-[#1F2937] dark:bg-[#111827]/90">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-[#9CA3AF] dark:hover:bg-[#1F2937] lg:hidden"
          onClick={onMenuClick}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <div className="text-lg font-semibold text-slate-900 sm:text-xl dark:text-[#E5E7EB]">
            {formatTime()}
          </div>
          <div className="text-xs text-slate-500 sm:text-sm dark:text-[#9CA3AF]">{formatDate()}</div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#9CA3AF]">
            {userDetails?.role?.toUpperCase()}
          </span>
          <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-[#9CA3AF] dark:hover:bg-[#1F2937]">
            <BellIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-[#9CA3AF] dark:hover:bg-[#1F2937]"
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-[#9CA3AF] dark:hover:bg-[#1F2937] sm:hidden"
        >
          {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-[#1F2937] dark:bg-[#111827] dark:text-[#E5E7EB] dark:hover:bg-[#1F2937]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6366F1] text-xs font-semibold text-white">
              {userDetails?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block">{userDetails?.name}</span>
            <ChevronDownIcon className="h-4 w-4 text-slate-400 dark:text-[#9CA3AF]" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-sm focus:outline-none dark:border-[#1F2937] dark:bg-[#111827]">
            <div className="px-2 py-2">
              <div className="text-sm font-semibold text-slate-900 dark:text-[#E5E7EB]">{userDetails?.name}</div>
              <div className="text-xs text-slate-500 dark:text-[#9CA3AF]">{userDetails?.email}</div>
            </div>
            <div className="border-t border-slate-100 dark:border-[#1F2937]" />
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => navigate('/face-enroll')}
                  className={`mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left ${
                    active
                      ? 'bg-slate-50 text-slate-900 dark:bg-[#1F2937] dark:text-[#E5E7EB]'
                      : 'text-slate-600 dark:text-[#9CA3AF]'
                  }`}
                >
                  <FaceSmileIcon className="h-4 w-4" />
                  Re-enroll Face
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className={`mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left ${
                    active
                      ? 'bg-slate-50 text-slate-900 dark:bg-[#1F2937] dark:text-[#E5E7EB]'
                      : 'text-slate-600 dark:text-[#9CA3AF]'
                  }`}
                >
                  <UserCircleIcon className="h-4 w-4" />
                  Profile
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left ${
                    active
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
                      : 'text-rose-600'
                  }`}
                >
                  <PowerIcon className="h-4 w-4" />
                  Logout
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </header>
  );
};

export default Topbar;
