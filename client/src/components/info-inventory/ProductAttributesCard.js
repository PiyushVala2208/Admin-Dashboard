"use client";

import { memo } from "react";
import { SlidersHorizontal } from "lucide-react";

function ProductAttributesCard({ attributes }) {
  const hasAttributes = Array.isArray(attributes) && attributes.length > 0;

  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
        <SlidersHorizontal size={16} className="text-blue-500" />
        Product Details
      </div>

      {hasAttributes ? (
        <div className="space-y-3">
          {attributes.map((attribute) => {
            const value = String(attribute.value || "").trim();
            const displayValue = value || "Not set";
            return (
              <div
                key={attribute.id}
                className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 p-5 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    {attribute.name}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xs font-bold ${
                      value ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {displayValue}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs font-semibold text-slate-500">
          No category attributes found for this product.
        </div>
      )}
    </div>
  );
}

export default memo(ProductAttributesCard);
