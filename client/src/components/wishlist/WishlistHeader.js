"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";

// Props: { count }
function WishlistHeader({ count }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Favorites
          <Heart className="fill-purple-600 text-purple-600 mt-2" size={32} />
        </h1>
        <p className="text-slate-500 text-xs md:text-sm font-medium uppercase tracking-[0.2em]">
          {count} Items Reserved
        </p>
      </div>
      <Link
        href="/products"
        className="group flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 text-sm font-bold text-slate-700 hover:text-purple-600 transition-all hover:shadow-md"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Continue Shopping
      </Link>
    </div>
  );
}

export default memo(WishlistHeader);
