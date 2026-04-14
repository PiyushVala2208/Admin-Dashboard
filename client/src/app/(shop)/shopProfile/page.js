"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  ShoppingBag,
  Heart,
  MapPin,
  ChevronRight,
  ShoppingCart,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import AddressForm from "@/components/shop/AddressForm";
import api from "@/app/utils/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function ShopProfile() {
  const [user, setUser] = useState({
    name: "Luxury Member",
    email: "member@dshop.com",
    phone: "+91 98765 43210",
    role: "Premium Member",
    bio: "Fashion enthusiast exploring the finest collections at D.SHOP Boutique.",
    joinDate: "Jan 2026",
  });

  const [counts, setCounts] = useState({ orders: 0, wishlist: 0, cart: 0 });
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter()

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await api.get("/addresses");
      console.log("Full API Response:", response.data);

      const fetchedData = response.data.data;

      if (Array.isArray(fetchedData)) {
        setAddresses(fetchedData);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  }, []);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("Saved User from LS:", savedUser);

    if (savedUser.name) {
      setUser((prev) => ({
        ...prev,
        name: savedUser.name.trim(),
        email: savedUser.email,
        role: savedUser.role || "Admin",
      }));
    }

    fetchAddresses();

    const orders = JSON.parse(localStorage.getItem("my-orders") || "[]");
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCounts({
      orders: orders.length,
      wishlist: wishlist.length,
      cart: cart.length,
    });
  }, [fetchAddresses]);

  const handleSaveAddress = async (formData) => {
    try {
      setLoading(true);
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress.id}`, formData);
      } else {
        await api.post("/addresses", formData);
      }
      await fetchAddresses();
      setIsAddressModalOpen(false);
      setEditingAddress(null);
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;
    try {
      await api.delete(`/addresses/${id}`);
      await fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleLogout = () => {
      Cookies.remove("token");
      Cookies.remove("user");
      localStorage.removeItem("user");
      localStorage.removeItem("cart");
  
      window.dispatchEvent(new Event("storage"));
      router.push("/");
    };

  return (
    <div className="min-h-screen bg-[#F5F3FF] pb-20">
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

      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-4xl md:rounded-[40px] p-6 md:p-8 shadow-xl shadow-[#4C1D95]/5 border border-white">
              <h3 className="text-[10px] md:text-[11px] font-black uppercase text-[#4C1D95] tracking-[0.2em] mb-6">
                Shopping Activity
              </h3>

              <div className="space-y-3">
                {[
                  {
                    label: "My Orders",
                    count: counts.orders,
                    icon: <ShoppingBag size={18} />,
                    href: "/my-orders",
                  },
                  {
                    label: "Wishlist",
                    count: counts.wishlist,
                    icon: <Heart size={18} />,
                    href: "/wishlist",
                  },
                  {
                    label: "My Cart",
                    count: counts.cart,
                    icon: <ShoppingCart size={18} />,
                    href: "/cart",
                  },
                ].map((item, i) => (
                  <Link
                    href={item.href}
                    key={i}
                    className="flex items-center justify-between p-4 bg-[#F5F3FF] rounded-2xl md:rounded-3xl group cursor-pointer hover:bg-[#8B5CF6] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-[#8B5CF6] group-hover:text-white">
                        {item.icon}
                      </div>
                      <span className="text-sm font-bold text-[#4C1D95] group-hover:text-white">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-5 bg-white border border-red-50 text-red-500 rounded-4xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Logout Session
            </button>
          </div>

          <div className="lg:col-span-8 space-y-8">
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
                ].map((item, idx) => (
                  <div
                    key={idx}
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

            <div className="bg-white rounded-4xl md:rounded-[40px] shadow-xl shadow-[#4C1D95]/5 border border-white overflow-hidden">
              <div className="p-6 md:p-8 border-b border-[#F5F3FF] flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-serif italic text-[#4C1D95]">
                    Shipping Addresses
                  </h2>
                  <p className="text-[9px] md:text-[10px] text-[#4C1D95]/40 font-bold uppercase tracking-widest mt-1">
                    Manage your delivery locations
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setIsAddressModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#8B5CF6] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#4C1D95] transition-all shadow-md shadow-purple-200"
                >
                  <Plus size={16} /> Add New
                </button>
              </div>

              <div className="divide-y divide-[#F5F3FF]">
                {addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="group p-6 md:p-8 hover:bg-[#FDFCFE] transition-all relative"
                    >
                      <div className="flex items-start gap-4 md:gap-6">
                        <div className="p-3.5 bg-[#F5F3FF] text-[#A78BFA] rounded-xl md:rounded-2xl group-hover:text-[#8B5CF6] group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                          <MapPin size={20} />
                        </div>

                        <div className="flex-1 pr-20 md:pr-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[9px] font-black text-[#A78BFA] uppercase tracking-widest px-2 py-0.5 bg-white border border-slate-100 rounded-md">
                              {addr.address_type}
                            </span>
                            {addr.is_default && (
                              <span className="text-[9px] font-black text-green-600 uppercase tracking-widest px-2 py-0.5 bg-green-50 rounded-md">
                                Default
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm md:text-base font-bold text-[#4C1D95]">
                            {addr.full_name}
                          </h4>
                          <p className="text-xs text-[#4C1D95]/60 mt-1 leading-relaxed max-w-md">
                            {addr.house_info}, {addr.area_info}, {addr.city},
                            {addr.state} -
                            <span className="font-bold">{addr.pincode}</span>
                          </p>
                          <p className="text-[11px] font-bold text-[#8B5CF6] mt-3 flex items-center gap-1.5">
                            <Phone size={12} /> {addr.phone}
                          </p>
                        </div>

                        <div className="hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                          <button
                            onClick={() => {
                              setEditingAddress(addr);
                              setIsAddressModalOpen(true);
                            }}
                            className="p-2.5 bg-white border border-[#F5F3FF] text-blue-500 rounded-xl hover:bg-blue-50 transition-all shadow-sm"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteAddress(addr.id)}
                            className="p-2.5 bg-white border border-[#F5F3FF] text-red-500 rounded-xl hover:bg-red-50 transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex md:hidden absolute top-6 right-6 gap-2">
                        <button
                          onClick={() => {
                            setEditingAddress(addr);
                            setIsAddressModalOpen(true);
                          }}
                          className="p-2 bg-[#F5F3FF] text-[#8B5CF6] rounded-lg"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="p-2 bg-red-50 text-red-500 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <p className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-widest italic">
                      No addresses saved yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAddressModalOpen && (
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleSaveAddress}
          onClose={() => setIsAddressModalOpen(false)}
        />
      )}
    </div>
  );
}
