"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Loader2,
} from "lucide-react";
import api from "@/app/utils/api";
import EditUserModal from "@/components/EditUserModal";

export default function UserInfopage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error("User not found:", err);
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      alert("User deleted!");
      router.push("/users/all");
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="font-bold text-slate-600">Fetching Profile...</p>
      </div>
    );

  if (!user)
    return (
      <div className="p-10 text-center flex flex-col items-center gap-4">
        <XCircle size={48} className="text-red-400" />
        <p className="text-xl font-bold text-slate-800">User not found!</p>
        <button
          onClick={() => router.push("/users/all")}
          className="text-blue-600 font-medium"
        >
          Return to User List
        </button>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => router.push("/users/all")}
        className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Users
      </button>

      <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-slate-800 to-black p-6 sm:p-10 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 ring-4 ring-white/5 flex items-center justify-center text-4xl font-black shadow-inner backdrop-blur-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  {user.name}
                </h1>
                <p className="text-white/60 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">
                  <Mail size={16} /> {user.email}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                  <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-white/10 backdrop-blur-md uppercase tracking-wider border border-white/10">
                    {user.role}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider border ${
                      user.status === "Active"
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : "bg-red-500/20 text-red-300 border-red-500/30"
                    }`}
                  >
                    {user.status || "Active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-all font-bold text-sm border border-white/10 active:scale-95"
              >
                <Pencil size={18} /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-red-500/20 active:scale-95"
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User size={22} className="text-blue-600" />
              </div>
              <h2 className="font-bold text-xl text-slate-800 tracking-tight">
                Personal Details
              </h2>
            </div>

            <div className="space-y-5">
              <DetailRow
                label="Full Name"
                value={user.name}
                icon={<User size={14} />}
              />
              <DetailRow
                label="Email Address"
                value={user.email}
                icon={<Mail size={14} />}
              />
              <DetailRow
                label="Phone Number"
                value={user.phone || "+91 00000 00000"}
                icon={<Phone size={14} />}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Shield size={22} className="text-purple-600" />
              </div>
              <h2 className="font-bold text-xl text-slate-800 tracking-tight">
                Security & Account
              </h2>
            </div>

            <div className="space-y-5">
              <DetailRow label="Account Role" value={user.role} badge />
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 text-sm font-medium">
                  Account Status
                </span>
                <span className="font-bold">
                  {user.status === "Active" ? (
                    <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs">
                      <CheckCircle2 size={14} /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1 rounded-full text-xs">
                      <XCircle size={14} /> Inactive
                    </span>
                  )}
                </span>
              </div>
              <DetailRow
                label="Member Since"
                value={user.joined || "22nd Aug, 2025"}
                icon={<Calendar size={14} />}
              />
            </div>
          </div>
        </div>
      </div>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={() => {
          setIsEditModalOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}

function DetailRow({ label, value, icon, badge }) {
  return (
    <div className="flex justify-between items-center group py-1">
      <div className="flex flex-col">
        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
          {label}
        </span>
        <span className="text-slate-700 font-semibold text-sm sm:text-base">
          {value}
        </span>
      </div>
      {icon && (
        <div className="text-slate-200 group-hover:text-blue-400 transition-colors">
          {icon}
        </div>
      )}
      {badge && (
        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
          {value}
        </span>
      )}
    </div>
  );
}
