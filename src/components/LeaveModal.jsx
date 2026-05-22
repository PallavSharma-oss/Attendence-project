// src/components/LeaveModal.jsx
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const LeaveModal = ({ open, onClose, formData, onChange, onSubmit }) => {
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
            <Dialog.Panel className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-md dark:border-[#1F2937] dark:bg-[#111827]">
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-[#E5E7EB]">
                Leave Application
              </Dialog.Title>
              <p className="mt-1 text-sm text-slate-500 dark:text-[#9CA3AF]">
                Submit a leave request for approval.
              </p>

              <form onSubmit={onSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-[#E5E7EB]">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={onChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-[#E5E7EB]">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={onChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-[#E5E7EB]">Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={onChange}
                    rows={4}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#1F2937] dark:text-[#9CA3AF] dark:hover:bg-[#1F2937]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default LeaveModal;
