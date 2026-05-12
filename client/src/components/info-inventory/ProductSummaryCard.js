"use client";

import { memo } from "react";
import Image from "next/image";
import { IndianRupee, Layers, Loader2, Package, Trash2 } from "lucide-react";

const extractSizeLabel = (variant) => {
  if (!variant) return "";

  const attributeSize = Array.isArray(variant.variant_attributes)
    ? variant.variant_attributes.find((entry) =>
        /size/i.test(String(entry.attributeName || entry.name || "")),
      )?.value
    : null;

  if (attributeSize) {
    return String(attributeSize).trim();
  }

  const raw = String(variant.size || variant.label || "").trim();
  if (!raw) return "";

  const pipeParts = raw
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  const lastPipe = pipeParts[pipeParts.length - 1] || raw;

  const colonParts = lastPipe
    .split(":")
    .map((part) => part.trim())
    .filter(Boolean);
  const lastColon = colonParts[colonParts.length - 1] || lastPipe;

  return lastColon || raw;
};

// Props: { item, displayImage, displaySKU, displayDescription, uniqueColors, selectedColor, availableSizes, selectedVariant, onColorChange, onSelectVariant, isDeletingVariant, onDeleteVariant, displayPrice, displayStock }
function ProductSummaryCard({
  item,
  displayImage,
  displaySKU,
  displayDescription,
  uniqueColors,
  selectedColor,
  availableSizes,
  selectedVariant,
  onColorChange,
  onSelectVariant,
  isDeletingVariant,
  onDeleteVariant,
  displayPrice,
  displayStock,
}) {
  return (
    <div className="bg-white p-6 sm:p-10 shadow-xl border border-slate-100 rounded-[3rem] relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-80 h-80 relative rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              priority
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <Package size={80} strokeWidth={1} />
            </div>
          )}
        </div>

        <div className="flex-1">
          <span className="inline-block text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 py-1.5 px-4 rounded-full mb-4">
            {item.category}
          </span>
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            {item.name}
          </h1>
          <p className="text-slate-400 text-[11px] font-mono font-bold tracking-widest mb-6">
            SKU: {displaySKU}
          </p>

          <div className="mb-6 max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Description
            </p>
            <p className="text-sm leading-7 text-slate-600">
              {displayDescription}
            </p>
          </div>

          {item.has_variants && uniqueColors.length > 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                  Select Color
                </h3>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((color) => {
                    const hasLowStockInColor = item.variants.some(
                      (v) => v.color === color && v.variant_stock <= 10,
                    );
                    return (
                      <button
                        key={color}
                        onClick={() => onColorChange(color)}
                        className={`relative px-5 py-2 rounded-2xl text-xs font-bold transition-all border-2 ${
                          selectedColor === color
                            ? "border-blue-600 bg-blue-50 text-blue-700 scale-105 shadow-md"
                            : hasLowStockInColor
                              ? "border-red-100 bg-white text-slate-500 hover:border-red-200"
                              : "border-slate-100 bg-white text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {color}

                        {hasLowStockInColor && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                  Available Sizes
                </h3>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((variant) => {
                    const isLow = variant.variant_stock <= 10;
                    const sizeLabel = extractSizeLabel(variant) || "N/A";
                    return (
                      <button
                        key={variant.id}
                        onClick={() => onSelectVariant(variant)}
                        className={`relative min-w-12 h-12 flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all border-2 ${
                          selectedVariant?.id === variant.id
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                            : isLow
                              ? "bg-red-50 text-red-600 border-red-200 hover:border-red-400"
                              : "bg-white text-slate-600 border-slate-100 hover:border-blue-400"
                        }`}
                      >
                        <span>{sizeLabel}</span>
                        {isLow && (
                          <span
                            className={`text-[8px] absolute -bottom-2 px-1 rounded bg-red-600 text-white leading-tight ${
                              selectedVariant?.id === variant.id
                                ? "opacity-100"
                                : "opacity-80"
                            }`}
                          >
                            LOW
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-slate-50">
        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-green-600">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">
              Price
            </p>
            <p className="text-2xl font-black text-slate-900">
              ₹{Number(displayPrice).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-purple-600">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">
              Stock
            </p>
            <p className="text-2xl font-black text-slate-900">
              {displayStock} <span className="text-xs">Units</span>
            </p>
          </div>
        </div>
      </div>

      {selectedVariant && (
        <div className="mt-8 p-4 bg-red-50/50 rounded-2xl border border-red-100 flex justify-between items-center">
          <span className="text-[10px] font-bold text-red-600 uppercase">
            Manage Selected Variant
          </span>
          <button
            onClick={onDeleteVariant}
            disabled={isDeletingVariant}
            className="p-2.5 bg-white text-red-500 rounded-xl hover:bg-red-500 hover:text-red-50 shadow-sm transition-all"
          >
            {isDeletingVariant ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(ProductSummaryCard);
