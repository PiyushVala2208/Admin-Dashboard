"use client";
import { useState, useEffect, useRef } from "react";
import { User, Mail, Edit, Lock, X, Camera, Loader2 } from "lucide-react";
import api from "@/app/utils/api";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    profile_pic: null,
  });

  const BACKEND_URL = "http://localhost:8000";

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setProfile(JSON.parse(savedUser));
    }
  }, []);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Bhai, 8MB se kam ki photo daal!");
      return;
    }

    const formData = new FormData();
    formData.append("profile_pic", file);

    setUploading(true);
    try {
      const res = await api.post("/users/profile-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedProfile = { ...profile, profile_pic: res.data.profile_pic };
      setProfile(updatedProfile);
      localStorage.setItem("user", JSON.stringify(updatedProfile));

      alert("Profile picture updated!");
      window.location.reload();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Photo upload fail ho gayi!");
    } finally {
      setUploading(false);
    }
  };

  const [password, setPassword] = useState({
    currentPass: "",
    newPass: "",
    confirm: "",
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/users/${profile.id}`, {
        name: profile.name,
        email: profile.email,
        role: profile.role,
      });

      localStorage.setItem("user", JSON.stringify(profile));
      setIsEditing(false);
      alert("Profile Updated Successfully!!!");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    if (e) e.preventDefault();
    if (!password.currentPass || !password.newPass) {
      alert("Please fill all fields");
      return;
    }
    if (password.newPass !== password.confirm) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const response = await api.put("/users/change-password", {
        currentPass: password.currentPass,
        newPass: password.newPass,
      });
      alert(response.data.message);
      setPassword({ currentPass: "", newPass: "", confirm: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Error updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 bg-blue-50 rounded-lg">
          <User size={28} className="text-blue-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          My Profile
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-10">
          <div className="relative group shrink-0">
            <div
              onClick={handleImageClick}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-white shadow-xl transition-all hover:ring-8 hover:ring-blue-50 active:scale-95"
            >
              <img
                src={
                  profile.profile_pic
                    ? `${BACKEND_URL}${profile.profile_pic}`
                    : `${BACKEND_URL}/uploads/profiles/default.png`
                }
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `${BACKEND_URL}/uploads/profiles/default.png`;
                }}
              />
              <div className="absolute rounded-full inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={30} className="text-white" />
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />

            {uploading && (
              <div className="absolute inset-0 bg-white/80 rounded-full flex flex-col items-center justify-center backdrop-blur-sm">
                <Loader2
                  className="animate-spin text-blue-600 mb-1"
                  size={24}
                />
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                  Uploading
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mb-8">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {profile.name}
                </h2>
                <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {profile.role}
                </span>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 w-full sm:w-auto justify-center"
              >
                {isEditing ? <X size={18} /> : <Edit size={18} />}
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none disabled:opacity-60 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none disabled:opacity-60 font-medium"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 flex justify-center sm:justify-start">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 mt-8 sm:mt-10">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-red-50 rounded-xl">
            <Lock size={20} className="text-red-500" />
          </div>
          Security Settings
        </h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-2">
              <input
                type="password"
                name="currentPass"
                value={password.currentPass}
                onChange={handlePasswordChange}
                placeholder="Current Password"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition text-black font-medium"
              />
            </div>
            <div className="space-y-2">
              <input
                type="password"
                name="newPass"
                value={password.newPass}
                onChange={handlePasswordChange}
                placeholder="New Password"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition text-black font-medium"
              />
            </div>
            <div className="space-y-2">
              <input
                type="password"
                name="confirm"
                value={password.confirm}
                onChange={handlePasswordChange}
                placeholder="Confirm Password"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition text-black font-medium"
              />
            </div>
          </div>
          <div className="flex justify-center sm:justify-start">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-lg"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
