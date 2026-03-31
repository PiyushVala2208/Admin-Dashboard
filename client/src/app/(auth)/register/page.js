"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/app/utils/api";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);

      if (res.status === 201) {
        alert("Registration Successful! Please login.");
        router.push("/login");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Registration fail !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5">
      <div className="max-w-md w-full space-y-8 p-10 bg-slate-50 shadow-lg rounded-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 tracking-tight italic py-2">
            Create Account
          </h1>
          <p className="text-sm text-gray-500">
            Join the premium dashboard experience.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="enter full name..."
                className="mt-1 block w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="enter yuor email..."
                className="mt-1 block w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="enter yuor password..."
                className="mt-1 block w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className=" flex justify-center mt-5 w-37.5 py-3 px-5  border-none rounded-lg shadow-sm text-sm font-semibold focus:outline-none  
                        bg-gradient-to-r from-slate-800 to-black text-white  bg-gradient-to-r from-slate-500 to-black text-white 
                        transition-all duration-1000 ease-out hover:from-black hover:to-slate-500  hover:scale-105 hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Wait...
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-500 hover:text-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
