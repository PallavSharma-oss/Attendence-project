import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import IDCard from '../components/IDCard';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { userDetails } = useAuth();
  const navigate = useNavigate();

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-[#0B1220]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your account and download your ID card</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Profile Information */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
              <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
                Profile Information
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400">Full Name</p>
                  <p className="mt-1 text-slate-900 dark:text-slate-100">{userDetails?.name}</p>
                </div>

                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400">Email</p>
                  <p className="mt-1 text-slate-900 dark:text-slate-100">{userDetails?.email}</p>
                </div>

                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400">Department</p>
                  <p className="mt-1 text-slate-900 dark:text-slate-100">{userDetails?.department}</p>
                </div>

                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400">Employee ID</p>
                  <p className="mt-1 font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {userDetails?.employeeId}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400">Role</p>
                  <p className="mt-1 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                    {userDetails?.role === 'admin' ? 'Administrator' : 'Employee'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ID Card Section */}
          <div className="lg:col-span-2">
            {userDetails && userDetails.employeeId ? (
              <IDCard user={userDetails} />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
                <p className="text-slate-600 dark:text-slate-400">
                  ID card is being generated. Please wait or refresh the page.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
