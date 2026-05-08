"use client";

import { memo } from "react";
import { AlertTriangle } from "lucide-react";

// Props: { message: string }
function InventoryFormErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-800 shadow-sm">
      <AlertTriangle size={18} className="text-rose-500" />
      Error: {message}
    </div>
  );
}

export default memo(InventoryFormErrorAlert);
