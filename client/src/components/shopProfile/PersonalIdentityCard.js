"use client";

import { memo } from "react";
import { ChevronRight, Mail, MapPin, Phone, User } from "lucide-react";

// Props: { user }
function PersonalIdentityCard({ user }) {
  return (
    <div className="bg-white rounded-4xl md:rounded-[40px] shadow-xl shadow-[#4C1D95]/5 border border-white overflow-hidden">
      <div className="p-6 md:p-8 border-b border-[#F5F3FF] flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-serif italic text-[#4C1D95]">
            Personal Identity
          </h2>
          <p className="text-[9px] md:text-[10px] text-[#4C1D95]/40 font-bold uppercase tracking-widest mt-1">
            Managed Account Details
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#F5F3FF]">
        {[
          {
            label: "Full Name",
            value: user.name,
            icon: <User size={18} />,
          },
          {
            label: "Email Address",
            value: user.email,
            icon: <Mail size={18} />,
          },
          {
            label: "Phone Number",
            value: user.phone,
            icon: <Phone size={18} />,
          },
          {
            label: "Style Bio",
            value: user.bio,
            icon: <MapPin size={18} />,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-6 md:p-8 group hover:bg-[#FDFCFE] transition-all"
          >
            <div className="flex items-center gap-4 md:gap-5">
              <div className="p-3 bg-[#F5F3FF] text-[#A78BFA] rounded-xl md:rounded-2xl group-hover:text-[#8B5CF6] group-hover:bg-white group-hover:shadow-sm transition-all">
                {item.icon}
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-[#A78BFA] uppercase tracking-widest">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-[#4C1D95] mt-0.5 truncate max-w-50 md:max-w-none">
                  {item.value}
                </p>
              </div>
            </div>
            <ChevronRight
              size={18}
              className="text-[#EEEBFF] group-hover:text-[#8B5CF6] transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(PersonalIdentityCard);
