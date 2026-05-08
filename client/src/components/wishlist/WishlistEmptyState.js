"use client";

import { memo } from "react";
import Link from "next/link";
import { Ghost, Sparkles } from "lucide-react";

function WishlistEmptyState() {
  return (
    <div className="bg-white rounded-[3rem] p-12 md:p-24 border border-dashed border-slate-200 text-center shadow-sm max-w-3xl mx-auto">
      <div className="relative inline-block mb-8">
        <div className="absolute -inset-4 bg-purple-50 rounded-full blur-2xl opacity-60 animate-pulse" />
        <div className="relative p-8 bg-slate-50 rounded-[2.5rem] text-slate-300">
          <Ghost size={80} strokeWidth={1.5} />
        </div>
      </div>
      <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight">
        Your collection is empty.
      </h2>
      <Link
        href="/products"
        className="inline-flex items-center gap-3 bg-purple-600 text-white px-12 py-5 rounded-4xl font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 active:scale-95"
      >
        <Sparkles size={18} /> Discover Now
      </Link>
    </div>
  );
}

export default memo(WishlistEmptyState);
