"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ChevronLeft,
  Package,
  MapPin,
  CreditCard,
  Receipt,
  Calendar,
  Hash,
  CheckCircle2,
  Truck,
  Box,
  Gift,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const statusSteps = ["Placed", "Processing", "Shipped", "Delivered"];
  const currentStatusIndex = order ? statusSteps.findIndex(
    (s) => s.toUpperCase() === order.status?.toUpperCase()
  ) : 0;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:8000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );

  if (!order) return null;

  const ship = order.shipping_details || {};

  return (
    <div className="min-h-screen bg-[#FDFCFE] py-12 px-4 sm:px-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-[#F5F3FF] to-transparent -z-10" />

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#4C1D95]/40 hover:text-[#4C1D95] transition-colors font-bold uppercase tracking-widest text-[10px] mb-10"
        >
          <ChevronLeft size={16} /> Back to Orders
        </button>

        <div className="bg-white border border-[#DDD6FE] rounded-[3rem] p-10 mb-12 shadow-xl shadow-purple-100/30">
          <div className="flex justify-between items-center relative">
            <div className="absolute h-0.5 w-full bg-[#F5F3FF] top-1/2 -translate-y-1/2 left-0 z-0" />
            <div
              className="absolute h-0.5 bg-[#4C1D95] top-1/2 -translate-y-1/2 left-0 z-0 transition-all duration-1000 ease-in-out"
              style={{
                width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
              }}
            />

            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div
                  key={step}
                  className="relative z-10 flex flex-col items-center gap-3"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 ${
                      isCompleted
                        ? "bg-[#4C1D95] border-[#4C1D95] text-white shadow-lg shadow-purple-200"
                        : "bg-white border-[#DDD6FE] text-[#DDD6FE]"
                    } ${isCurrent ? "scale-110 ring-4 ring-purple-50" : ""}`}
                  >
                    {step === "Placed" && <CheckCircle2 size={20} className={isCurrent ? "animate-pulse" : ""} />}
                    {step === "Processing" && <Box size={20} className={isCurrent ? "animate-bounce" : ""} />}
                    {step === "Shipped" && <Truck size={20} className={isCurrent ? "animate-pulse" : ""} />}
                    {step === "Delivered" && <Gift size={20} className={isCurrent ? "animate-bounce" : ""} />}
                  </div>

                  <span
                    className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-500 ${
                      isCompleted ? "text-[#4C1D95]" : "text-[#DDD6FE]"
                    }`}
                  >
                    {step}
                  </span>

                  {isCurrent && (
                    <div className="absolute -bottom-2 w-1 h-1 bg-[#8B5CF6] rounded-full animate-ping" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-12 space-y-2">
          <h1 className="text-4xl font-serif italic text-[#4C1D95] tracking-tight">
            Order Story
          </h1>
          <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4C1D95]/40">
            <div className="flex items-center gap-2 bg-[#F5F3FF] px-3 py-1 rounded-full">
              <Hash size={12} /> LUX-{order.id}
            </div>
            <div className="flex items-center gap-2 border border-[#DDD6FE] px-3 py-1 rounded-full">
              <Calendar size={12} />
              {new Date(order.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-[#DDD6FE] rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-xl font-serif italic text-[#4C1D95] mb-8 flex items-center gap-3">
                <Package className="text-[#8B5CF6]" /> Curated Selection
              </h2>
              <div className="space-y-8">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6 group">
                    <div className="relative overflow-hidden rounded-3xl border border-[#DDD6FE]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#4C1D95] text-lg">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#4C1D95]/40 font-black uppercase tracking-widest mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#8B5CF6] text-lg">
                        ₹
                        {(
                          parseFloat(item.price) * item.quantity
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#DDD6FE] rounded-[2.5rem] p-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between text-[#4C1D95]/60 text-xs font-bold uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>
                    ₹{parseFloat(order.total_amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#4C1D95]/60 text-xs font-bold uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-[#8B5CF6]">Complimentary</span>
                </div>
                <div className="pt-6 border-t border-[#F5F3FF] flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#4C1D95]/40">
                      Final Value
                    </p>
                    <span className="font-serif italic text-2xl text-[#4C1D95]">
                      Total Investment
                    </span>
                  </div>
                  <span className="text-4xl font-black text-[#8B5CF6] tracking-tighter">
                    ₹{parseFloat(order.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#4C1D95] text-white rounded-[3rem] p-10 shadow-2xl shadow-purple-200 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />

              <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-purple-300">
                Destination
              </h2>
              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-2xl font-serif italic mb-2">
                    {ship.name || order.full_name || "Guest User"}
                  </p>
                  <p className="text-sm text-purple-100/70 leading-relaxed font-medium">
                    {ship.address || order.address}
                    <br />
                    {ship.city || order.city}{ship.pincode || order.pincode ? `, ${ship.pincode || order.pincode}` : ""}
                  </p>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-purple-300 mb-1">
                    Contact
                  </p>
                  <p className="font-bold">{ship.phone || order.phone || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#DDD6FE] rounded-[2.5rem] p-8 text-center transition-all hover:border-[#8B5CF6]/30">
              <div className="w-12 h-12 bg-[#F5F3FF] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#8B5CF6]">
                <CreditCard size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#4C1D95]/40 mb-1">
                Transaction Mode
              </p>
              <p className="font-bold text-[#4C1D95] uppercase tracking-tighter">
                {order.payment_method}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}