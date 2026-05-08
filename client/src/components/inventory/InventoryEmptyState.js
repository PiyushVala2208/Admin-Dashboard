"use client";
import { Package } from "lucide-react";

export default function InventoryEmptyState({ message = "No items found" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="bg-slate-50 p-4 rounded-full mb-4">
        <Package className="text-slate-300" size={40} />
      </div>
      <h3 className="text-lg font-bold text-slate-800">
        {message}
      </h3>
    </div>
  );
}