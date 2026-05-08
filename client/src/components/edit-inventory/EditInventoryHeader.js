"use client";

import { memo } from "react";
import { Package, X } from "lucide-react";

// Props: { onClose }
function EditInventoryHeader({ onClose }) {
  return (
    <div className="flex justify-between items-center p-6 md:px-10 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10">
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-xl shadow-slate-200">
          <Package size={24} />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Edit Master Product
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Inventory Management
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="group bg-slate-50 hover:bg-red-50 p-3 rounded-2xl transition-all border border-slate-100"
      >
        <X
          size={20}
          className="text-slate-400 group-hover:text-red-500 transition-colors"
        />
      </button>
    </div>
  );
}

export default memo(EditInventoryHeader);
