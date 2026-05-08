"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import api from "@/app/utils/api";
import AddressForm from "@/components/shop/AddressForm";
import { dispatchCartSync } from "@/app/utils/browserStorage";
import ProfileHero from "@/components/shopProfile/ProfileHero";
import ShoppingActivityCard from "@/components/shopProfile/ShoppingActivityCard";
import LogoutButton from "@/components/shopProfile/LogoutButton";
import PersonalIdentityCard from "@/components/shopProfile/PersonalIdentityCard";
import AddressBookCard from "@/components/shopProfile/AddressBookCard";

export default function ShopProfilePage() {
  const router = useRouter();

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
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await api.get("/addresses");
      const fetched = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];
      setAddresses(fetched);
    } catch (error) {
      toast.error(error?.message || "Failed to fetch addresses.");
      setAddresses([]);
    }
  }, []);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (savedUser?.name) {
      setUser((current) => ({
        ...current,
        name: String(savedUser.name).trim(),
        email: savedUser.email || current.email,
        role: savedUser.role || current.role,
      }));
    }

    const orders = JSON.parse(localStorage.getItem("my-orders") || "[]");
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    setCounts({
      orders: Array.isArray(orders) ? orders.length : 0,
      wishlist: Array.isArray(wishlist) ? wishlist.length : 0,
      cart: Array.isArray(cart) ? cart.length : 0,
    });

    fetchAddresses();
  }, [fetchAddresses]);

  const handleSaveAddress = async (payload) => {
    setIsSavingAddress(true);
    try {
      if (editingAddress?.id) {
        await api.put(`/addresses/${editingAddress.id}`, payload);
        toast.success("Address updated.");
      } else {
        await api.post("/addresses", payload);
        toast.success("Address added.");
      }

      await fetchAddresses();
      setEditingAddress(null);
      setIsAddressModalOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to save address.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const confirmed = window.confirm("Are you sure you want to delete this address?");
    if (!confirmed) return;

    try {
      await api.delete(`/addresses/${addressId}`);
      await fetchAddresses();
      toast.success("Address deleted.");
    } catch (error) {
      toast.error(error?.message || "Failed to delete address.");
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    dispatchCartSync();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] pb-20">
      <ProfileHero user={user} />

      <div className="relative z-20 mx-auto -mt-10 max-w-5xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <ShoppingActivityCard counts={counts} />
            <LogoutButton onLogout={handleLogout} />
          </div>

          <div className="space-y-8 lg:col-span-8">
            <PersonalIdentityCard user={user} />

            <AddressBookCard
              addresses={addresses}
              onAdd={() => {
                setEditingAddress(null);
                setIsAddressModalOpen(true);
              }}
              onEdit={(address) => {
                setEditingAddress(address);
                setIsAddressModalOpen(true);
              }}
              onDelete={handleDeleteAddress}
            />
          </div>
        </div>
      </div>

      {isAddressModalOpen ? (
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleSaveAddress}
          onClose={() => {
            if (!isSavingAddress) {
              setIsAddressModalOpen(false);
              setEditingAddress(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}
