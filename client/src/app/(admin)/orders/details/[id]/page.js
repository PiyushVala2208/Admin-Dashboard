"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
  User,
  Mail,
  MapPin,
} from "lucide-react";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");

      if (!token || token === "undefined") {
        toast.error("Session expired. Please login again.");
        return;
      }

      const res = await axios.get(
        `http://localhost:8000/api/orders/admin/details/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true, 
        },
      );

      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error("Fetch Error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to load order specs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const getParsedShipping = () => {
    if (!order || !order.shipping_details) return {};
    try {
      return typeof order.shipping_details === "string"
        ? JSON.parse(order.shipping_details)
        : order.shipping_details;
    } catch (e) {
      console.error("Shipping Parse Error:", e);
      return {};
    }
  };

  const ship = getParsedShipping();

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const token = Cookies.get("token");
      const res = await axios.put(
        `http://localhost:8000/api/orders/admin/status/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setOrder({ ...order, status: newStatus });
      }
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400 animate-pulse">
        Initializing Data Stream...
      </div>
    );
  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center font-black uppercase text-red-500">
        Order Not Found
      </div>
    );

  return (
    <div className="p-4 sm:p-10 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all mb-8"
      >
        <div className="p-2 rounded-full group-hover:bg-slate-100 transition-all">
          <ArrowLeft size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">
          Back to Logistics
        </span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Package className="text-blue-500" /> Order Manifest
              </h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {order.items?.length || 0} Items Total
              </span>
            </div>

            <div className="p-8 space-y-6">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center gap-6 group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 relative group-hover:shadow-xl transition-all duration-500">
                    <img
                      src={item.image || "/api/placeholder/100/100"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tighter">
                      {item.name}
                    </h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">
                      ₹{parseFloat(item.price).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Subtotal
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-50">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Financial Total
                  </p>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                    ₹{parseFloat(order.total_amount).toLocaleString()}
                  </h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
                  <CreditCard size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    {order.payment_method || "PREPAID"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-linear-to-r from-slate-800 to-black rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] mb-6">
                Logistics Status
              </h3>

              <div className="space-y-3">
                {[
                  "PENDING",
                  "PROCESSING",
                  "SHIPPED",
                  "DELIVERED",
                  "CANCELLED",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updating}
                    className={`w-full py-4 px-6 rounded-2xl flex justify-between items-center transition-all duration-300 border ${
                      order.status === status
                        ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-900"
                        : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400"
                    }`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      {status}
                    </span>
                    {order.status === status && (
                      <CheckCircle size={16} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Customer Identity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase">
                    {ship.name ||
                      order.customer_name ||
                      order.user?.name ||
                      "Unknown Customer"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    System ID: {order.id || order._id || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <Mail size={18} />
                </div>
                <p className="text-[10px] font-black text-slate-900 truncate uppercase">
                  {ship.email ||
                    order.customer_email ||
                    order.user?.email ||
                    "No Email Found"}
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-900 leading-relaxed uppercase tracking-tight">
                    {ship.address ||
                      order.shipping_address ||
                      "No address provided"}
                  </p>
                  {(ship.city || ship.pincode) && (
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      {ship.city} {ship.pincode && `- ${ship.pincode}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
