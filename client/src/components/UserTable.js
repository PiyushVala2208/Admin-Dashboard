"use client";
import { Pencil, Trash2 } from "lucide-react";

export default function UserTable({
  users,
  itemsPerPage,
  onEdit,
  onDelete,
  router,
}) {
  return (
    <div className="hidden md:block bg-white shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-100 overflow-hidden min-h-[585px]">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
          <tr>
            <th className="p-4 font-semibold uppercase tracking-wider">
              User Details
            </th>
            <th className="p-4 font-semibold uppercase tracking-wider">Role</th>
            <th className="p-4 font-semibold uppercase tracking-wider">
              Status
            </th>
            <th className="p-4 font-semibold uppercase tracking-wider text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {/* Real Users */}
          {users.map((user) => (
            <tr
              key={user.id || user._id} 
              onClick={() => router.push(`/users/info/${user.id}`)}
              className="hover:bg-blue-50/50 cursor-pointer transition-colors group h-[65px]"
            >
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">{user.name}</span>
                  <span className="text-xs text-slate-400">{user.email}</span>
                </div>
              </td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 text-[11px] font-bold rounded-full border ${
                    user.role === "Admin"
                      ? "bg-purple-50 text-purple-700 border-purple-100"
                      : user.role === "Manager"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                  }`}
                >
                  {user.role?.toUpperCase()}
                </span>
              </td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 text-[11px] font-bold rounded-full border ${
                    user.status?.toLowerCase() === "active"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}
                >
                  {user.status?.toUpperCase() || "ACTIVE"}
                </span>
              </td>
              <td className="p-4">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={(e) => onEdit(e, user)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={(e) => onDelete(e, user.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {users.length < itemsPerPage &&
            Array.from({ length: itemsPerPage - users.length }).map(
              (_, index) => (
                <tr
                  key={`empty-row-${index}`} 
                  className="h-[65px] border-none pointer-events-none" 
                >
                  <td colSpan="4">&nbsp;</td>
                </tr>
              ),
            )}
        </tbody>
      </table>
    </div>
  );
}
