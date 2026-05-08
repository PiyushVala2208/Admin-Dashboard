"use client";

import { memo } from "react";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

function EmptyCartState() {
  return (
    <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed max-w-2xl mx-auto">
      <ShoppingBag size={48} className="mx-auto mb-8 text-slate-200" />
      <h2 className="text-2xl font-black text-slate-900 mb-2">
        Your cart feels lonely
      </h2>
      <Link
        href="/products"
        className="inline-flex bg-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest mt-8"
      >
        Go To Shop
      </Link>
    </div>
  );
}

export default memo(EmptyCartState);
