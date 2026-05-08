"use client";

import { memo } from "react";
import { Shield, User } from "lucide-react";

// Props: { user }
function ProfileHero({ user }) {
  return (
    <div className="w-full h-64 bg-linear-to-r from-[#4C1D95] to-[#8B5CF6] relative flex items-center justify-center shadow-lg px-4">
      <div className="max-w-5xl w-full flex items-center gap-6 md:gap-10 z-10">
        <div className="relative group shrink-0">
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-white border-4 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
            <User
              size={60}
              className="text-[#8B5CF6] w-12 h-12 md:w-15 md:h-15"
              strokeWidth={1}
            />
          </div>
        </div>
        <div className="text-white overflow-hidden">
          <h1 className="text-2xl md:text-5xl font-serif italic tracking-tight truncate pb-2">
            {user.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] border border-white/20 flex items-center gap-1.5">
              <Shield size={12} /> {user.role}
            </span>
            <span className="text-[9px] md:text-[10px] font-medium opacity-70">
              Joined {user.joinDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProfileHero);
