"use client";
import { useState } from "react";
import Link from "next/link";
import api from "@/app/utils/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      document.cookie = `token=${res.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("login Successful");
      window.location.replace("/");
    } catch (error) {
      alert(error.response?.data?.message || "Email or Password incorrect!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5">
      <div className="max-w-md w-full space-y-8 p-10 bg-slate-50 shadow-lg rounded-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 tracking-tight italic py-2">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to your admin account.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                required
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter you email..."
                className="mt-1 block w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                required
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="enter yuor password..."
                className="mt-1 block w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className=" flex justify-center mt-5 w-[150px] py-3 px-5  border-none rounded-lg shadow-sm text-sm font-semibold focus:outline-none  
                        bg-gradient-to-r from-slate-800 to-black text-white  bg-gradient-to-r from-slate-500 to-black text-white 
                        transition-all duration-1000 ease-out hover:from-black hover:to-slate-500  hover:scale-105 hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Wait...
                </div>
              ) : (
                "Log In"
              )}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-500 hover:text-blue-700"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
