"use client";

import { memo } from "react";
import { History } from "lucide-react";

// Props: { displayStock, totalVariants }
function InventoryActivityCard({ displayStock, totalVariants }) {
  const statusLabel =
    displayStock > 10
      ? "IN STOCK"
      : displayStock > 0
        ? "LOW STOCK"
        : "OUT OF STOCK";
  const statusClass =
    displayStock > 10
      ? "bg-green-500/20 text-green-400"
      : displayStock > 0
        ? "bg-yellow-500/20 text-yellow-400"
        : "bg-red-500/20 text-red-400";

  return (
    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
      <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
      <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
        <History size={16} className="text-blue-400" /> Activity & Summary
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between py-3 border-b border-white/10">
          <span className="text-[10px] text-slate-500 uppercase font-bold">
            Status
          </span>
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex justify-between py-3">
          <span className="text-[10px] text-slate-500 uppercase font-bold">
            Total Variants
          </span>
          <span className="text-sm font-bold text-slate-200">
            {totalVariants} items
          </span>
        </div>
      </div>
      {displayStock <= 10 && displayStock > 0 && (
        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          <p className="text-[10px] text-red-400 font-bold leading-tight">
            Warning: This variant needs a restock soon. Only {displayStock}{" "}
            units left.
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(InventoryActivityCard);
