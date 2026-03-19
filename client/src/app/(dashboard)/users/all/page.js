"use client";
import { useState, useEffect } from "react";
import { Pencil, Search, Trash2, Users2, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/app/utils/api";
import EditUserModal from "@/components/EditUserModal";

export default function AllUserPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete user.");
    }
  };

  const handleEdit = (e, user) => {
    e.stopPropagation();
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="font-bold text-slate-600">Loading Users...</p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users2 size={24} className="text-blue-600" />
            </div>
            System Users
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <button
          onClick={() => router.push("/users/add")}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-200 active:scale-95 w-full sm:w-auto"
        >
          <Plus size={20} /> Add New User
        </button>
      </div>

      <div className="relative mb-6 group max-w-md">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-white border border-slate-200 pl-11 pr-4 rounded-xl py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      <div className="hidden md:block bg-white shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
            <tr>
              <th className="p-4 font-semibold uppercase tracking-wider">
                User Details
              </th>
              <th className="p-4 font-semibold uppercase tracking-wider">
                Role
              </th>
              <th className="p-4 font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="p-4 font-semibold uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                onClick={() => router.push(`/users/info/${user.id}`)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
              >
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">
                      {user.name}
                    </span>
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
                      user.status === "Active"
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
                      onClick={(e) => handleEdit(e, user)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, user.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => router.push(`/users/info/${user.id}`)}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md active:scale-[0.98] transition-transform"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight">
                  {user.name}
                </h3>
                <p className="text-slate-500 text-xs">{user.email}</p>
              </div>
              <span
                className={`px-2 py-1 text-[10px] font-black rounded-md border ${
                  user.role === "Admin"
                    ? "bg-purple-50 text-purple-700 border-purple-100"
                    : "bg-blue-50 text-blue-700 border-blue-100"
                }`}
              >
                {user.role?.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-end mt-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Status
                </span>
                <span className="text-sm font-bold text-green-600">
                  {user.status || "Active"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleEdit(e, user)}
                  className="p-3 bg-blue-50 text-blue-600 rounded-xl"
                >
                  <Pencil size={20} />
                </button>
                <button
                  onClick={(e) => handleDelete(e, user.id)}
                  className="p-3 bg-red-50 text-red-600 rounded-xl"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 mt-6">
          <Users2 className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-medium">
            {search
              ? `No users found matching "${search}"`
              : "No users in the system"}
          </p>
        </div>
      )}

      {isModalOpen && (
        <EditUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          onUpdate={() => {
            fetchUsers();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
