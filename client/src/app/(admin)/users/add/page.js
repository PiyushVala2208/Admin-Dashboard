"use client";
import { useState } from "react";
import api from "@/app/utils/api";
import {
  UserPlus,
  Mail,
  User,
  Lock,
  UserCog2,
  RotateCcw,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
  const router = useRouter();

  const initialState = {
    name: "",
    email: "",
    password: "",
    role: "User",
  };

  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/users", formData);
      alert("User Added Successfully! 🚀");
      setFormData(initialState);
      router.push("/users/all");
    } catch (error) {
      console.error("Error adding User:", error);
      alert("Error adding user! Check server logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 sm:p-3 bg-blue-500/10 rounded-xl">
          <UserPlus size={28} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Add New User
          </h1>
          <p className="text-sm text-slate-500">
            Create a new account and assign system roles
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Username */}
          <div className="group">
            <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
              <User size={16} /> Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="enter name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Email */}
          <div className="group">
            <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
              <Mail size={16} /> Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="enter email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                <Lock size={16} /> Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                <UserCog2 size={16} /> Assign Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-semibold appearance-none cursor-pointer"
              >
                <option value="User">Regular User</option>
                <option value="Admin">Administrator</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setFormData(initialState)}
              className="order-2 sm:order-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all font-medium text-sm active:scale-95"
            >
              <RotateCcw size={16} />
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="order-1 sm:order-2 flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all font-semibold text-sm shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
