"use client";
import { useState, useEffect } from "react";
import api from "@/app/utils/api";
import { User, Mail, UserCog2, X } from "lucide-react";

export default function EditUserModal({ isOpen, onClose, user, onUpdate }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "User",
    status: "Active",
  });

  useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/users/${user.id}`, formData);
      onUpdate();
      onClose();
    } catch (err) {
      console.error(
        "Update failed:",
        err.response ? err.response.data : err.message,
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            Edit User Details
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 transition p-1 hover:bg-slate-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 no-scrollbar">
          <form
            id="edit-user-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-2">
                <User size={14} className="text-blue-500" /> Full Name
              </label>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-2">
                <Mail size={14} className="text-blue-500" /> Email Address
              </label>
              <input
                type="email"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-2">
                  <UserCog2 size={14} /> Role
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                  Status
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-slate-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 order-2 sm:order-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition font-medium"
          >
            Cancel
          </button>
          <button
            form="edit-user-form"
            type="submit"
            className="flex-1 order-1 sm:order-2 px-4 py-3 bg-slate-900 text-white hover:bg-black rounded-xl transition font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
