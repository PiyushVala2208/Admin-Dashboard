"use client";

import { memo } from "react";
import { Minus, Plus } from "lucide-react";
import { span } from "framer-motion/client";

const isColorAttribute = (name = "") =>
  ["color", "colour"].includes(String(name).trim().toLowerCase());

const getSwatchStyle = (value = "") => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  const preset = {
    black: "#111827",
    white: "#f8fafc",
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    purple: "#8b3dff",
    pink: "#ec4899",
    gray: "#94a3b8",
    grey: "#94a3b8",
    silver: "#cbd5e1",
    gold: "#f59e0b",
    navy: "#1e3a8a",
    beige: "#F5F5DC",
    brown: "#92400e",
    orange: "#f97316",
  };

  if (preset[normalized]) return preset[normalized];
  return normalized || "#cbd5e1";
};

function VariantPicker({
  variationAttributes,
  selectedOptions,
  onOptionChange,
  isOutOfStock,
  selectedQuantity,
  onQuantityChange,
  displayStock,
  optionAvailability,
}) {
  return (
    <>
      {variationAttributes.length > 0 ? (
        <div className="space-y-6 mb-6">
          {variationAttributes.map((attribute) => {
            const selectedValue = selectedOptions[attribute.attributeId] || "";
            return (
              <div key={attribute.attributeId}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">
                  {attribute.name}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {attribute.options.map((option) => {
                    const isSelected = selectedValue === option;
                    const isSwatch = isColorAttribute(attribute.name);
                    const isAvailable = optionAvailability?.[
                      attribute.attributeId
                    ]
                      ? optionAvailability[attribute.attributeId][option] !==
                        false
                      : true;
                    const isDisabled = !isAvailable;
                    return (
                      <button
                        key={`${attribute.attributeId}-${option}`}
                        type="button"
                        onClick={() =>
                          isDisabled
                            ? null
                            : onOptionChange(attribute.attributeId, option)
                        }
                        aria-disabled={isDisabled}
                        className={`relative inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-all ${
                          isSelected
                            ? "border-[#8b3dff] bg-violet-50 text-[#8b3dff]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
                        } ${
                          isDisabled
                            ? "cursor-not-allowed opacity-60 grayscale"
                            : ""
                        }`}
                      >
                        {isSwatch ? (
                          <span
                            className="h-4 w-4 rounded-full border border-slate-300"
                            style={{ backgroundColor: getSwatchStyle(option) }}
                          />
                        ) : null}
                        {option}
                        
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {!isOutOfStock ? (
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Quantity
          </span>
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() =>
                onQuantityChange(Math.max(1, selectedQuantity - 1))
              }
              className="p-3 hover:bg-slate-50 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-bold border-x border-slate-100">
              {selectedQuantity}
            </span>
            <button
              onClick={() =>
                onQuantityChange(
                  Math.min(selectedQuantity + 1, displayStock, 8),
                )
              }
              disabled={selectedQuantity >= Math.min(displayStock, 8)}
              className={`p-3 transition-all ${
                selectedQuantity >= Math.min(displayStock, 8)
                  ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default memo(VariantPicker);
