"use client";

import { memo } from "react";
import { ArrowRight } from "lucide-react";

// Props: { subtotal, shipping, onCheckout }
function OrderSummaryCard({ subtotal, shipping, onCheckout }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200 shadow-xl shadow-purple-100/20">
      <h2 className="text-xl font-black text-slate-900 mb-8 border-b pb-4">
        Order Summary
      </h2>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-slate-500 font-medium">
          <span>Subtotal</span>
          <span className="text-slate-900">₹{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-slate-500 font-medium">
          <span>Shipping</span>
          <span
            className={
              shipping === 0 ? "text-green-600 font-bold" : "text-slate-900"
            }
          >
            {shipping === 0 ? "FREE" : `₹${shipping}`}
          </span>
        </div>

        <div className="pt-4 border-t border-dashed flex justify-between items-end">
          <span className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Total Amount
          </span>
          <span className="text-3xl font-black text-purple-600">
            ₹{(subtotal + shipping).toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-purple-600 transition-all shadow-lg active:scale-95"
      >
        Proceed To Checkout <ArrowRight size={18} />
      </button>
    </div>
  );
}

export default memo(OrderSummaryCard);
