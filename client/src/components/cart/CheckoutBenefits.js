"use client";

import { memo } from "react";
import { AlertCircle, ShieldCheck, Truck } from "lucide-react";

function CheckoutBenefits() {
  return (
    <div className="space-y-3 px-1">
      <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-3xl transition-all hover:bg-white hover:shadow-md hover:shadow-purple-100/20 group">
        <div className="p-2.5 bg-green-50 rounded-2xl text-green-600 group-hover:scale-110 transition-transform">
          <ShieldCheck size={20} />
        </div>
        <div className="flex flex-col">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-800 leading-none mb-1">
            Secure Checkout
          </p>
          <p className="text-[10px] font-medium text-slate-500">
            Your data is protected by SSL
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-3xl transition-all hover:bg-white hover:shadow-md hover:shadow-purple-100/20 group">
        <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
          <Truck size={20} />
        </div>
        <div className="flex flex-col">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-800 leading-none mb-1">
            Reliable Shipping
          </p>
          <p className="text-[10px] font-medium text-slate-500">
            Fast delivery to your doorstep
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-3xl transition-all hover:bg-white hover:shadow-md hover:shadow-purple-100/20 group">
        <div className="p-2.5 bg-orange-50 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform">
          <AlertCircle size={20} />
        </div>
        <div className="flex flex-col">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-800 leading-none mb-1">
            Easy Support
          </p>
          <p className="text-[10px] font-medium text-slate-500">
            24/7 assistance for your order
          </p>
        </div>
      </div>
    </div>
  );
}

export default memo(CheckoutBenefits);
