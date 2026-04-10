"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Package,
  Clock,
  ChevronRight,
  ShoppingBag,
  LogIn,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Cookies from "js-cookie";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20";
      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/20";
      default:
        return "bg-purple-50 text-purple-700 border-purple-100 ring-purple-500/20";
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/orders/my-orders",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          },
        );

        if (res.data.success) {
          const sortedOrders = res.data.orders.sort((a, b) => {
            const getPriority = (status) => {
              const s = status?.toLowerCase();
              if (s === "cancelled") return 3;
              if (s === "delivered") return 2;
              return 1; 
            };

            const priorityA = getPriority(a.status);
            const priorityB = getPriority(b.status);

            if (priorityA !== priorityB) return priorityA - priorityB;

            return (
              new Date(b.created_at || b.createdAt) -
              new Date(a.created_at || a.createdAt)
            );
          });

          setOrders(sortedOrders);
        }
      } catch (err) {
        toast.error("Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FDFCFE] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-8 p-12 bg-white border border-[#DDD6FE] rounded-[3rem] shadow-2xl shadow-purple-100/50">
          <div className="mx-auto w-20 h-20 bg-[#F5F3FF] rounded-3xl flex items-center justify-center text-[#8B5CF6]">
            <ShoppingBag size={40} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-3xl font-serif italic text-[#4C1D95]">
              Exclusive Access
            </h2>
            <p className="text-[#4C1D95]/60 mt-4 text-sm leading-relaxed">
              Sign in to view your curated order history.
            </p>
          </div>
          <Link
            href="/login"
            className="flex items-center justify-center gap-3 w-full bg-[#4C1D95] text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFE] py-16 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h1 className="text-6xl font-serif italic text-[#4C1D95] tracking-tighter">
            Order <span className="text-[#8B5CF6]">Archive</span>
          </h1>
          <p className="text-[#4C1D95]/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
            Inventory & Management
          </p>
        </div>

        <div className="grid gap-8">
          {orders.map((order) => {
            const status = order.status?.toLowerCase();
            const isFinished = status === "delivered" || status === "cancelled";

            return (
              <div
                key={order.id || order._id}
                className={`group relative bg-white border rounded-[2.5rem] p-10 transition-all duration-500 ${
                  isFinished
                    ? "border-slate-100 opacity-75 grayscale-[0.8] hover:grayscale-0 hover:opacity-100"
                    : "border-[#DDD6FE] shadow-sm hover:shadow-2xl hover:shadow-purple-100/30"
                }`}
              >
                <div className="flex flex-col lg:flex-row justify-between gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[9px] font-black uppercase tracking-[0.15em] px-4 py-1.5 border rounded-full ring-4 ${getStatusStyles(order.status)}`}
                      >
                        {order.status || "Confirmed"}
                      </span>
                      {status === "delivered" && (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      )}
                      {status === "cancelled" && (
                        <XCircle size={16} className="text-rose-500" />
                      )}
                    </div>

                    <div>
                      <h2 className="text-3xl font-bold text-[#4C1D95] tracking-tight">
                        #LUX-{order.id || order._id?.slice(-6)}
                      </h2>
                      <div className="flex items-center gap-2 text-[#4C1D95]/30 font-black text-[10px] uppercase tracking-widest mt-2">
                        <Clock size={12} />
                        {new Date(
                          order.created_at || order.createdAt,
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col lg:items-end justify-center">
                    <p className="text-[10px] text-[#4C1D95]/40 font-black uppercase tracking-[0.2em] mb-1">
                      Value
                    </p>
                    <p className="text-5xl font-black text-[#4C1D95] tracking-tighter">
                      ₹{parseFloat(order.total_amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex -space-x-5">
                    {order.items?.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="relative group/img">
                        <img
                          src={item.image}
                          alt=""
                          className="h-20 w-20 rounded-2xl ring-8 ring-white object-cover border border-slate-100 transition-transform group-hover/img:-translate-y-2"
                        />
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/my-orders/${order.id || order._id}`}
                    className={`w-full md:w-auto px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 ${
                      status === "cancelled"
                        ? "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100"
                        : status === "delivered"
                          ? "bg-black text-white hover:bg-zinc-800"
                          : "bg-[#4C1D95] text-white hover:bg-[#7C3AED] shadow-xl shadow-purple-100"
                    }`}
                  >
                    Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
