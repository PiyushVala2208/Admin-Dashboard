"use client";

import { memo } from "react";

// Props: { onEdit, onDeleteProduct }
function InventoryActionsCard({ onEdit, onDeleteProduct }) {
  return (
    <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-sm">
      <button
        onClick={onEdit}
        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
      >
        Update Details
      </button>
      <button
        onClick={onDeleteProduct}
        className="w-full bg-white border border-red-100 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
      >
        Delete Product
      </button>
    </div>
  );
}

export default memo(InventoryActionsCard);
