"use client";
import React, { useState } from "react";
import { Search, Package, Truck, CheckCircle2, MapPin, Clock, ArrowRight, Loader2 } from "lucide-react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);

    setTimeout(() => {
      setTrackingData({
        id: orderId,
        status: 2, 
        estDelivery: "28 March, 2026",
        location: "Rajkot, Gujarat",
        history: [
          { time: "10:30 AM", date: "24 Mar", desc: "Out for Delivery", loc: "Local Hub" },
          { time: "09:00 PM", date: "23 Mar", desc: "Shipped from Warehouse", loc: "Mumbai" },
          { time: "02:15 PM", date: "23 Mar", desc: "Order Confirmed", loc: "System" },
        ]
      });
      setLoading(false);
    }, 1000);
  };

  const steps = [
    { label: "Confirmed", icon: <CheckCircle2 size={18} /> },
    { label: "Processing", icon: <Package size={18} /> },
    { label: "Shipped", icon: <Truck size={18} /> },
    { label: "Delivered", icon: <MapPin size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Simple Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Track Your Order</h1>
          <p className="text-slate-500 text-sm">Enter your order ID to get real-time delivery updates.</p>
        </div>

        {/* Search Input */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Order ID (e.g. #PV12345)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Track Status"}
            </button>
          </form>
        </div>

        {trackingData && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            <div className="bg-white rounded-2xl p-6 md:p-10 border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between relative gap-8 md:gap-0">
                {steps.map((step, index) => (
                  <div key={index} className="flex md:flex-col items-center gap-4 md:gap-3 relative z-10 md:w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${index <= trackingData.status ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-slate-200 text-slate-300"}`}>
                      {step.icon}
                    </div>
                    <span className={`text-xs font-bold ${index <= trackingData.status ? "text-slate-900" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`hidden md:block absolute top-5 left-1/2 w-full h-[2px] -z-10 ${index < trackingData.status ? "bg-purple-600" : "bg-slate-100"}`} />
                    )}
                    {index < steps.length - 1 && (
                      <div className={`md:hidden absolute left-5 top-10 w-[2px] h-8 -z-10 ${index < trackingData.status ? "bg-purple-600" : "bg-slate-100"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Delivery Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{trackingData.estDelivery}</p>
                      <p className="text-xs text-slate-500">Estimated Arrival</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{trackingData.location}</p>
                      <p className="text-xs text-slate-500">Shipping Address</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Latest Activity</h3>
                <div className="space-y-6">
                  {trackingData.history.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${i === 0 ? "bg-purple-600" : "bg-slate-300"}`} />
                        {i !== trackingData.history.length - 1 && <div className="w-[1px] h-full bg-slate-100 mt-1" />}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${i === 0 ? "text-slate-900" : "text-slate-500"}`}>{item.desc}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">{item.date} • {item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}