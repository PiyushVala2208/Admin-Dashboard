"use client";
import {
  Settings,
  Building2,
  UserCog,
  Bell,
  Moon,
  Globe,
  Loader2,
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/app/utils/api";

export default function SettingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "",
    companyEmail: "",
    phone: "",
    currency: "INR",
    adminName: "",
    adminEmail: "",
    darkmode: false,
    emailNotification: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/users/settings");
        if (res.data) {
          setSettings({
            companyName: res.data.company_name || "",
            companyEmail: res.data.company_email || "",
            phone: res.data.phone || "",
            currency: res.data.currency || "INR",
            darkmode: res.data.darkmode || false,
            emailNotification: res.data.email_notification || false,
            adminName: res.data.adminName || "",
            adminEmail: res.data.adminEmail || "",
          });
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaved = async () => {
    setSaving(true);
    try {
      const payload = {
        company_name: settings.companyName,
        company_email: settings.companyEmail,
        phone: settings.phone,
        currency: settings.currency,
        darkmode: settings.darkmode,
        email_notification: settings.emailNotification,
      };

      await api.put("/users/settings", payload);
      alert("Settings Synced to Cloud! 🚀");
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">
          Loading System Preferences...
        </p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8 sm:mb-10">
        <div className="p-2.5 bg-red-50 rounded-xl">
          <Settings className="text-red-500" size={28} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            System Settings
          </h1>
          <p className="text-sm text-slate-500">
            Manage your company and application preferences
          </p>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
            <Building2 size={20} className="text-blue-500" />
            <h2 className="text-lg font-bold text-slate-800">
              Company Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                placeholder="your company name"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Company Email
              </label>
              <input
                type="email"
                name="companyEmail"
                value={settings.companyEmail}
                onChange={handleChange}
                placeholder="comapany email address"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-blue-500 flex items-center gap-1">
                <Globe size={12} /> Regional Currency
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold appearance-none"
              >
                <option value="INR">₹ Indian Rupee (INR)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ British Pound (GBP)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
            <UserCog size={20} className="text-purple-500" />
            <h2 className="text-lg font-bold text-slate-800">
              Admin Account Info
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <input
                type="text"
                name="adminName"
                value={settings.adminName}
                onChange={handleChange}
                className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-500 cursor-not-allowed font-medium"
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Login Email
              </label>
              <input
                type="text"
                name="adminEmail"
                value={settings.adminEmail}
                onChange={handleChange}
                className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-500 cursor-not-allowed font-medium"
                readOnly
              />
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-400 italic">
            * Admin info can only be changed from the Profile tab.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
            <Bell size={20} className="text-orange-500" />
            <h2 className="text-lg font-bold text-slate-800">
              App Preferences
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 transition-colors hover:bg-slate-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <Moon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Dark Mode</p>
                  <p className="text-xs text-slate-500">
                    Reduce eye strain in low light
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                name="darkmode"
                checked={settings.darkmode}
                onChange={handleChange}
                className="w-6 h-6 rounded-lg cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 transition-colors hover:bg-slate-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                  <Bell size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Email Notifications
                  </p>
                  <p className="text-xs text-slate-500">
                    Get alerts for stock & orders
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                name="emailNotification"
                checked={settings.emailNotification}
                onChange={handleChange}
                className="w-6 h-6 rounded-lg cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-center sm:justify-end pt-4">
          <button
            onClick={handleSaved}
            disabled={saving}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-sm shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            {saving ? "Syncing..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
