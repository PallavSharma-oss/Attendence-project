import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const EditUserModal = ({ open, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'employee',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        role: user.role || 'employee',
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, formData);
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
            <Dialog.Panel className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-md dark:border-[#1F2937] dark:bg-[#111827]">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-[#E5E7EB]">
                  Edit User
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-[#1F2937]"
                >
                  <XMarkIcon className="h-5 w-5 text-slate-500 dark:text-[#9CA3AF]" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-[#E5E7EB]">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-[#E5E7EB]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#9CA3AF]"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-[#E5E7EB]">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Support">Support</option>
                    <option value="HR">HR</option>
                    <option value="Ops">Ops</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-[#E5E7EB]">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#9CA3AF]">
                    Admins can manage users and approve leave requests
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
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
                    Save Changes
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

export default EditUserModal;
