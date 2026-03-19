"use client";
import { Shield, Pencil, Trash2, Plus, Info, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function RolesPage() {
  const [roles, setRoles] = useState([
    {
      id: 1,
      rolename: "Admin",
      description: "Full system access with all administrative privileges",
      permissions: [
        "Manage Users",
        "Manage Inventory",
        "View Analytics",
        "Settings",
      ],
    },
    {
      id: 2,
      rolename: "Manager",
      description: "Manage users & inventory but limited system settings",
      permissions: ["Manage Users", "Manage Inventory", "View Analytics"],
    },
    {
      id: 3,
      rolename: "User",
      description: "Basic access to view dashboard and personal profile",
      permissions: ["View Dashboard", "Edit Profile"],
    },
  ]);

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to remove this role?")) return;
    setRoles(roles.filter((role) => role.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield size={24} className="text-amber-600" />
            </div>
            System Roles
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Define and manage access control levels
          </p>
        </div>
      </div>

      <div className="hidden md:block bg-white shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
            <tr>
              <th className="p-5 font-semibold uppercase tracking-wider">
                Role Name
              </th>
              <th className="p-5 font-semibold uppercase tracking-wider">
                Description
              </th>
              <th className="p-5 font-semibold uppercase tracking-wider">
                Permissions
              </th>
              <th className="p-5 font-semibold uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => (
              <tr
                key={role.id}
                className="hover:bg-amber-50/30 transition-colors group"
              >
                <td className="p-5">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                      role.rolename === "Admin"
                        ? "bg-red-50 text-red-600 border-red-100"
                        : role.rolename === "Manager"
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}
                  >
                    {role.rolename}
                  </span>
                </td>
                <td className="p-5 text-slate-500 leading-relaxed max-w-xs italic">
                  "{role.description}"
                </td>
                <td className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {role.permissions?.map((perm, index) => (
                      <span
                        key={index}
                        className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle size={10} className="text-green-500" />{" "}
                        {perm}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex justify-end gap-2">
                    <button className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight italic">
                {role.rolename}
              </h3>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 bg-blue-50 rounded-lg">
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
                  className="p-2 text-red-600 bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-500 text-sm italic">
              <Info size={16} className="mt-1 flex-shrink-0" />
              <p>{role.description}</p>
            </div>

            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Capabilities
              </p>
              <div className="flex flex-wrap gap-2">
                {role.permissions?.map((perm, index) => (
                  <span
                    key={index}
                    className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-100"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Shield className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-medium">
            No roles defined in the system
          </p>
        </div>
      )}
    </div>
  );
}
