"use client";
import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, Lock, Bell, 
  ShieldCheck, Trash2, Save, 
  CreditCard, MapPin, Loader2,
  CheckCircle2, Globe, ShieldAlert
} from "lucide-react";

export default function SinglePageSettings() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "Premium Member",
    bio: ""
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setFormData(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify(formData));
      setIsSaving(false);
      alert("All settings updated successfully! ✨");
    }, 1200);
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F5F3FF]">
      <Loader2 className="animate-spin text-[#8B5CF6]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F7FF] py-8 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header with Floating Save Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-white">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-serif italic text-[#4C1D95]">Account Settings</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A78BFA] mt-1">Manage your complete profile</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#8B5CF6] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#4C1D95] transition-all shadow-xl shadow-[#8B5CF6]/20 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isSaving ? "Updating..." : "Save All Changes"}
          </button>
        </div>

        <div className="space-y-8">
          
          {/* SECTION 1: GENERAL INFORMATION */}
          <div className="bg-white rounded-[40px] shadow-xl shadow-[#4C1D95]/5 border border-white overflow-hidden">
            <div className="p-8 border-b border-[#F5F3FF] bg-[#FDFCFE] flex items-center gap-4">
              <div className="p-3 bg-[#F5F3FF] rounded-2xl text-[#8B5CF6]"><User size={20} /></div>
              <h2 className="text-xl font-bold text-[#4C1D95]">General Information</h2>
            </div>
            <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-[#A78BFA] uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl border border-[#F5F3FF] bg-[#FDFCFE] focus:border-[#8B5CF6] outline-none transition-all text-sm font-bold text-[#4C1D95]" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#A78BFA] uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl border border-[#F5F3FF] bg-[#FDFCFE] focus:border-[#8B5CF6] outline-none transition-all text-sm font-bold text-[#4C1D95]" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#A78BFA] uppercase tracking-widest ml-1">Contact Number</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl border border-[#F5F3FF] bg-[#FDFCFE] focus:border-[#8B5CF6] outline-none transition-all text-sm font-bold text-[#4C1D95]" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#A78BFA] uppercase tracking-widest ml-1">Shipping Location</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border border-[#F5F3FF] bg-[#FDFCFE] focus:border-[#8B5CF6] outline-none transition-all text-sm font-bold text-[#4C1D95] pr-12" 
                  />
                  <MapPin size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A78BFA]" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: SECURITY & AUTH */}
          <div className="bg-white rounded-[40px] shadow-xl shadow-[#4C1D95]/5 border border-white overflow-hidden">
            <div className="p-8 border-b border-[#F5F3FF] bg-[#FDFCFE] flex items-center gap-4">
              <div className="p-3 bg-[#F5F3FF] rounded-2xl text-[#8B5CF6]"><Lock size={20} /></div>
              <h2 className="text-xl font-bold text-[#4C1D95]">Security Settings</h2>
            </div>
            <div className="p-8 md:p-12 space-y-10">
              {/* 2FA Toggle */}
              <div className="p-6 bg-[#F5F3FF] rounded-[28px] flex items-center justify-between border border-[#EEEBFF]">
                <div className="flex items-center gap-5">
                  <div className="hidden xs:flex p-3 bg-white rounded-xl text-[#8B5CF6] shadow-sm"><ShieldCheck size={24} /></div>
                  <div>
                    <p className="text-sm font-bold text-[#4C1D95]">Two-Factor Authentication</p>
                    <p className="text-[10px] text-[#A78BFA] font-bold uppercase tracking-wider">Extra layer of protection</p>
                  </div>
                </div>
                <div className="w-14 h-7 bg-[#8B5CF6] rounded-full relative cursor-pointer">
                   <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#A78BFA] uppercase tracking-widest ml-1">Change Password</label>
                  <input type="password" placeholder="New Password" className="w-full px-6 py-4 rounded-2xl border border-[#F5F3FF] bg-[#FDFCFE] focus:border-[#8B5CF6] outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#A78BFA] uppercase tracking-widest ml-1">Confirm Password</label>
                  <input type="password" placeholder="Confirm New Password" className="w-full px-6 py-4 rounded-2xl border border-[#F5F3FF] bg-[#FDFCFE] focus:border-[#8B5CF6] outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: NOTIFICATIONS & PREFERENCES */}
          <div className="bg-white rounded-[40px] shadow-xl shadow-[#4C1D95]/5 border border-white overflow-hidden">
            <div className="p-8 border-b border-[#F5F3FF] bg-[#FDFCFE] flex items-center gap-4">
              <div className="p-3 bg-[#F5F3FF] rounded-2xl text-[#8B5CF6]"><Bell size={20} /></div>
              <h2 className="text-xl font-bold text-[#4C1D95]">Notifications & Alerts</h2>
            </div>
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Order Status Updates", "Promotional Offers", "Newsletter Subscription", "Security Alerts"].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-[#FDFCFE] rounded-3xl border border-[#F5F3FF] hover:border-[#8B5CF6]/30 transition-all">
                    <span className="text-sm font-bold text-[#4C1D95]">{item}</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: DANGER ZONE */}
          <div className="p-8 md:p-12 bg-red-50 rounded-[40px] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-red-600 mb-2">
                <ShieldAlert size={18} />
                <h4 className="text-sm font-black uppercase tracking-widest">Danger Zone</h4>
              </div>
              <p className="text-sm text-red-900/60 font-medium italic">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <button className="w-full md:w-auto px-10 py-4 bg-white text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-200">
              Delete Account
            </button>
          </div>

          {/* FOOTER SUPPORT */}
          <div className="p-10 bg-linear-to-r from-[#4C1D95] to-[#8B5CF6] rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-[#4C1D95]/30">
            <div className="text-center md:text-left">
              <h4 className="text-2xl font-serif italic mb-2">Need assistance?</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Our priority support team is active 24/7</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
               <button className="flex-1 md:flex-none px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl text-[10px] font-black uppercase border border-white/20 hover:bg-white/20 transition-all">
                Help Docs
              </button>
              <button className="flex-1 md:flex-none px-8 py-4 bg-white text-[#4C1D95] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                Live Chat
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}