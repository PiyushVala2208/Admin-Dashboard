"use client";
import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, Shield, Camera, 
  Edit3, LogOut, ShoppingBag, Heart, 
  MapPin, ChevronRight, Star 
} from "lucide-react";

export default function LocalStorageProfile() {
  const [user, setUser] = useState({
    name: "Luxury Member",
    email: "member@dshop.com",
    phone: "+91 98765 43210",
    role: "Premium Member",
    bio: "Fashion enthusiast exploring the finest collections at D.SHOP Boutique.",
    joinDate: "Jan 2026",
    orderCount: 0,
    wishlistCount: 0,
    reviewCount: 0
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      
      const savedOrders = JSON.parse(localStorage.getItem("my-orders") || "[]");
      const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const savedReviews = JSON.parse(localStorage.getItem("reviews") || "[]");

      setUser({
        ...parsedUser,
        orderCount: savedOrders.length,
        wishlistCount: savedWishlist.length,
        reviewCount: savedReviews.length,
        role: parsedUser.role || "Premium Member",
        joinDate: parsedUser.joinDate || "Jan 2026",
        bio: parsedUser.bio || "Fashion enthusiast exploring D.SHOP."
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3FF] pb-20">
      
      <div className="w-full h-64 bg-linear-to-r from-[#4C1D95] to-[#8B5CF6] relative flex items-center justify-center shadow-lg px-4">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="max-w-5xl w-full flex items-center gap-6 md:gap-10 z-10">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-white border-4 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
              <User size={60} className="text-[#8B5CF6] w-12 h-12 md:w-15 md:h-15" strokeWidth={1} />
            </div>
            <button className="absolute bottom-1 right-1 p-2 bg-white text-[#4C1D95] rounded-full shadow-lg border border-[#EEEBFF]">
              <Camera size={16} />
            </button>
          </div>
          
          <div className="text-white overflow-hidden">
            <h1 className="text-2xl md:text-5xl font-serif italic tracking-tight truncate pb-2">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] border border-white/20 flex items-center gap-1.5">
                <Shield size={12} /> {user.role}
              </span>
              <span className="text-[9px] md:text-[10px] font-medium opacity-70">Joined {user.joinDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-xl shadow-[#4C1D95]/5 border border-white">
              <h3 className="text-[10px] md:text-[11px] font-black uppercase text-[#4C1D95] tracking-[0.2em] mb-6">Activity Overview</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-[#F5F3FF] rounded-2xl md:rounded-3xl group cursor-pointer hover:bg-[#8B5CF6] transition-all">
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={18} className="text-[#8B5CF6] group-hover:text-white" />
                    <span className="text-sm font-bold text-[#4C1D95] group-hover:text-white">My Orders</span>
                  </div>
                  <span className="text-xs font-black text-[#8B5CF6] group-hover:text-white bg-white group-hover:bg-white/20 px-2 py-1 rounded-lg">
                    {user.orderCount.toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F5F3FF] rounded-2xl md:rounded-3xl group cursor-pointer hover:bg-[#8B5CF6] transition-all">
                  <div className="flex items-center gap-3">
                    <Heart size={18} className="text-[#8B5CF6] group-hover:text-white" />
                    <span className="text-sm font-bold text-[#4C1D95] group-hover:text-white">Wishlist</span>
                  </div>
                  <span className="text-xs font-black text-[#8B5CF6] group-hover:text-white bg-white group-hover:bg-white/20 px-2 py-1 rounded-lg">
                    {user.wishlistCount.toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-[#F5F3FF] rounded-2xl md:rounded-3xl group cursor-pointer hover:bg-[#8B5CF6] transition-all">
                  <div className="flex items-center gap-3">
                    <Star size={18} className="text-[#8B5CF6] group-hover:text-white" />
                    <span className="text-sm font-bold text-[#4C1D95] group-hover:text-white">Reviews</span>
                  </div>
                  <span className="text-xs font-black text-[#8B5CF6] group-hover:text-white bg-white group-hover:bg-white/20 px-2 py-1 rounded-lg">
                    {user.reviewCount.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="w-full py-5 bg-white border border-red-50 text-red-500 rounded-[32px] font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Logout Session
            </button>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-xl shadow-[#4C1D95]/5 border border-white overflow-hidden">
              <div className="p-6 md:p-8 border-b border-[#F5F3FF] flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-serif italic text-[#4C1D95]">Profile Settings</h2>
                  <p className="text-[9px] md:text-[10px] text-[#4C1D95]/40 font-bold uppercase tracking-widest mt-1">Manage your identity at Boutique</p>
                </div>
                <button className="p-3 md:p-4 bg-[#F5F3FF] text-[#8B5CF6] rounded-2xl hover:bg-[#8B5CF6] hover:text-white transition-all">
                  <Edit3 size={18} />
                </button>
              </div>

              <div className="divide-y divide-[#F5F3FF]">
                {[
                  { label: "Full Name", value: user.name, icon: <User size={18} /> },
                  { label: "Email Address", value: user.email, icon: <Mail size={18} /> },
                  { label: "Phone Number", value: user.phone, icon: <Phone size={18} /> },
                  { label: "Account Role", value: user.role, icon: <Shield size={18} /> },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 md:p-8 group hover:bg-[#FDFCFE] transition-all">
                    <div className="flex items-center gap-4 md:gap-5">
                      <div className="p-3 bg-[#F5F3FF] text-[#A78BFA] rounded-xl md:rounded-2xl group-hover:text-[#8B5CF6] group-hover:bg-white group-hover:shadow-sm transition-all">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[10px] font-black text-[#A78BFA] uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-bold text-[#4C1D95] mt-0.5 truncate max-w-[200px] md:max-w-none">{item.value}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#EEEBFF] group-hover:text-[#8B5CF6] transition-all" />
                  </div>
                ))}
              </div>

              <div className="p-6 md:p-8 bg-[#FDFCFE]">
                <p className="text-[10px] font-black text-[#A78BFA] uppercase tracking-widest mb-3">Your Style Story</p>
                <p className="text-sm font-medium text-[#4C1D95]/70 leading-relaxed italic border-l-4 border-[#8B5CF6]/30 pl-4">
                  "{user.bio}"
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}