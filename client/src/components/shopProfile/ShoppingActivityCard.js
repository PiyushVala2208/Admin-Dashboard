"use client";

import { memo } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";

// Props: { counts }
function ShoppingActivityCard({ counts }) {
  return (
    <div className="bg-white rounded-4xl md:rounded-[40px] p-6 md:p-8 shadow-xl shadow-[#4C1D95]/5 border border-white">
      <h3 className="text-[10px] md:text-[11px] font-black uppercase text-[#4C1D95] tracking-[0.2em] mb-6">
        Shopping Activity
      </h3>

      <div className="space-y-3">
        {[
          {
            label: "My Orders",
            count: counts.orders,
            icon: <ShoppingBag size={18} />,
            href: "/my-orders",
          },
          {
            label: "Wishlist",
            count: counts.wishlist,
            icon: <Heart size={18} />,
            href: "/wishlist",
          },
          {
            label: "My Cart",
            count: counts.cart,
            icon: <ShoppingCart size={18} />,
            href: "/cart",
          },
        ].map((item) => (
          <Link
            href={item.href}
            key={item.label}
            className="flex items-center justify-between p-4 bg-[#F5F3FF] rounded-2xl md:rounded-3xl group cursor-pointer hover:bg-[#8B5CF6] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="text-[#8B5CF6] group-hover:text-white">
                {item.icon}
              </div>
              <span className="text-sm font-bold text-[#4C1D95] group-hover:text-white">
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default memo(ShoppingActivityCard);
