"use client";

import { memo } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

function CartItemCard({ item, itemKey, onQuantityChange, onRemove }) {
  const selectedAttributes = Array.isArray(item.selectedAttributes)
    ? item.selectedAttributes
    : [];
  const filteredAttributes = selectedAttributes.filter(
    (attribute) => !/color|colour/i.test(attribute.name || ""),
  );
  const selectionText = filteredAttributes.length
    ? filteredAttributes
        .map((attribute) => `${attribute.name}: ${attribute.value}`)
        .join(" | ")
    : item.selectedSize
      ? `Size: ${item.selectedSize}`
      : "Default";

  return (
    <div className="bg-white p-4 md:p-6 rounded-4xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row items-center gap-6 group transition-all hover:border-purple-200">
      <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="flex-1 text-center sm:text-left">
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
          {item.category}
        </p>
        <h3 className="font-extrabold text-purple-600 text-[22px] mb-1 tracking-wide">
          {item.name}
        </h3>
        <div className="space-y-1.5">
          <p className="text-[12px] font-bold">
            Color:{" "}
            <span className="text-slate-500">
              {item.selectedColor || "Default"}
            </span>
          </p>
          <p className="text-[11px] font-bold text-slate-500">
            {selectionText}
          </p>
        </div>

        <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 mb-3">
          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
            <button
              onClick={() => onQuantityChange(itemKey, -1)}
              disabled={item.quantity <= 1}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600 disabled:opacity-30"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-bold text-slate-900 text-[11px]">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(itemKey, 1)}
              disabled={item.quantity >= Math.min(item.stock, 8)}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600 disabled:opacity-30"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <p className="text-slate-400 text-sm font-medium italic">
          ₹{Number(item.price).toLocaleString()} each
        </p>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
        <p className="text-lg font-black text-slate-900 flex-1 sm:flex-none text-left sm:text-right">
          ₹{(item.price * item.quantity).toLocaleString()}
        </p>
        <button
          onClick={() => onRemove(itemKey)}
          className="text-slate-300 hover:text-red-500 transition-colors p-2"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}

export default memo(CartItemCard);
