"use client";
import {
  LogOut,
  Settings,
  UserCircle,
  Package2,
  ArrowUpRight,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "Guest",
    email: "guest@example.com",
    profile_pic: null,
  });
  const dropdownRef = useRef(null);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:8000";
  const DEFAULT_IMAGE = `${BACKEND_URL}/uploads/profiles/default.png`;

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUserData(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;
    try {
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      localStorage.clear();
      window.location.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getProfileSrc = () => {
    if (!userData.profile_pic) return DEFAULT_IMAGE;

    if (userData.profile_pic.startsWith("http")) return userData.profile_pic;

    return `${BACKEND_URL}${userData.profile_pic}`;
  };

  return (
    <nav className="flex items-center justify-between top-0 z-40 h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 sticky">
      <div className="flex-1">
        
      </div>

      <div
        ref={dropdownRef}
        className="relative flex items-center gap-3 md:gap-5"
      >
        <div className="hidden sm:flex flex-col items-right text-right border-l border-slate-200 pl-4 md:pl-6">
          <p className="text-sm font-bold text-slate-800 truncate max-w-37.5">
            {userData.name}
          </p>
          <p className="text-[10px] text-slate-500 font-medium truncate max-w-37.5">
            {userData.email}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-slate-100 cursor-pointer border border-slate-200 hover:border-blue-400 hover:ring-4 hover:ring-blue-50 transition-all duration-300 overflow-hidden"
          >
            <img
              src={getProfileSrc()}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_IMAGE;
              }}
            />
          </button>
          

          {isOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-200 p-2 animate-in fade-in zoom-in duration-200 z-50 origin-top-right">
              <div className="sm:hidden px-4 py-3 border-b border-slate-100 mb-1">
                <p className="text-sm font-bold text-slate-900">
                  {userData.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {userData.email}
                </p>
              </div>

              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all rounded-xl group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <UserCircle size={18} />
                </div>
                <span className="font-medium">My Profile</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all rounded-xl group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Settings size={18} />
                </div>
                <span className="font-medium">Account Settings</span>
              </Link>

              <div className="border-t border-slate-100 my-2"></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 w-full rounded-xl text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <LogOut size={18} />
                </div>
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
