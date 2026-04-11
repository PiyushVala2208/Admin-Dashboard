"use client";
import React from "react";
import { Check, XCircle } from "lucide-react";

export default function OrdersSidebarFilter({
  statusOptions,
  activeFilters,
  setActiveFilters,
}) {
  const toggleStatus = (status) => {
    setActiveFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      status: [],
      highValueOnly: false,
    });
  };

  const hasActiveFilters =
    activeFilters.status.length > 0 || activeFilters.highValueOnly;

  return (
    <aside className="w-full lg:w-60 shrink-0 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Quick Alerts
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[10px] flex items-center gap-1 text-red-500 hover:text-red-600 font-bold uppercase transition-colors"
          >
            <XCircle size={12} /> Clear
          </button>
        )}
      </div>

      <div>
        <button
          onClick={() =>
            setActiveFilters((prev) => ({
              ...prev,
              highValueOnly: !prev.highValueOnly,
            }))
          }
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
            activeFilters.highValueOnly
              ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
              : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
          }`}
        >
          <span className="text-xs font-bold uppercase">High Value (₹5k+)</span>
          <div
            className={`w-8 h-4 rounded-full relative transition-colors ${
              activeFilters.highValueOnly ? "bg-blue-500" : "bg-slate-300"
            }`}
          >
            <div
              className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${
                activeFilters.highValueOnly ? "left-5" : "left-1"
              }`}
            />
          </div>
        </button>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          Order Status
        </h3>
        <div className="space-y-1">
          {statusOptions.map((status) => {
            const isSelected = activeFilters.status.includes(status);
            return (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`w-full text-left text-xs py-2.5 px-3 rounded-lg flex justify-between items-center transition-all ${
                  isSelected
                    ? "bg-purple-50 text-purple-600 font-bold shadow-sm ring-1 ring-purple-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <span className="capitalize">{status.toLowerCase()}</span>
                {isSelected && <Check size={14} className="text-purple-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}