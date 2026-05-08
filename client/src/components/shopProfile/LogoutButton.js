"use client";

import { memo } from "react";
import { LogOut } from "lucide-react";

// Props: { onLogout }
function LogoutButton({ onLogout }) {
  return (
    <button
      onClick={onLogout}
      className="w-full py-5 bg-white border border-red-50 text-red-500 rounded-4xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
    >
      <LogOut size={18} /> Logout Session
    </button>
  );
}

export default memo(LogoutButton);
