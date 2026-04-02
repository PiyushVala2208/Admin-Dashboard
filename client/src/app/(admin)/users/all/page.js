"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Users2,
  Plus,
  Mail,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/app/utils/api";
import UserTable from "@/components/UserTable";
import UserSidebarFilter from "@/components/UserSidebarFilter";
import EditUserModal from "@/components/EditUserModal";
import Pagination from "@/components/Pagination";

export default function AllUserPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    roles: [],
    criticalOnly: false,
    inactiveOnly: false,
  });

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

  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch =
      (user.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      activeFilters.roles.length === 0 ||
      activeFilters.roles.includes(user.role);

    const matchesStatus = activeFilters.inactiveOnly
      ? user.status?.toLowerCase() === "inactive"
      : true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
        <p className="font-bold text-slate-600 animate-pulse">
          Loading System Users...
        </p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} /> Admin Control Panel
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            System Users
          </h1>
          <p className="text-slate-500 font-medium">
            Manage permissions, roles, and account status for all staff.
          </p>
        </div>
        <button
          onClick={() => router.push("/users/add")}
          className="group flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-blue-600 transition-all duration-300 font-bold shadow-xl shadow-slate-200 active:scale-95 w-full md:w-auto"
        >
          <Plus
            size={20}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
          Add New User
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-72 shrink-0">
          <div className="sticky top-8">
            <UserSidebarFilter
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
            />
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div className="relative group">
            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email or role..."
              className="w-full bg-white border-2 border-slate-100 pl-14 pr-6 rounded-2xl py-4 focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm text-slate-700 font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="hidden xl:block">
            {filteredUsers.length > 0 ? (
              <UserTable
                users={currentItems}
                itemsPerPage={itemsPerPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
                router={router}
              />
            ) : (
              <div className="bg-white shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="4" className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-slate-50 p-4 rounded-full mb-4">
                            <Users2 className="text-slate-300" size={40} />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800">
                            No users found
                          </h3>
                          <p className="text-slate-400 text-sm max-w-xs mx-auto">
                            We couldn't find anyone matching "{search}" or the
                            selected filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="xl:hidden">
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentItems.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => router.push(`/users/info/${user.id}`)}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                          <UserCircle size={28} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">
                            {user.name}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail size={12} /> {user.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          user.status?.toLowerCase() === "active"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {user.role}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleEdit(e, user)}
                          className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, user.id)}
                          className="p-2 bg-slate-50 text-red-600 rounded-xl hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-4 border-dashed border-slate-100">
                <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                  <Users2 className="text-slate-300" size={32} />
                </div>
                <h3 className="text-md font-bold text-slate-800">
                  No matching users
                </h3>
                <p className="text-slate-500 text-xs mt-1 px-10">
                  Try clearing filters to see more results.
                </p>
              </div>
            )}
          </div>

          {filteredUsers.length > itemsPerPage && (
            <div className="pt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

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
