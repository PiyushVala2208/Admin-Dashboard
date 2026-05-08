"use client";
import React, { useState } from "react";
import { X, ShoppingBag, CheckCircle2, AlertCircle } from "lucide-react";

export default function SizeSelectionModal({
  isOpen,
  onClose,
  product,
  onConfirm,
}) {
  const [selectedVariant, setSelectedVariant] = useState(null);

  if (!isOpen || !product) return null;

  const targetColor = product.selectedColor?.toLowerCase().trim();

  const filteredVariants =
    product.variants?.filter((v) => {
      return v.color?.toLowerCase().trim() === targetColor;
    }) || [];

  const handleConfirmation = () => {
    if (selectedVariant) {
      onConfirm(selectedVariant);
      setSelectedVariant(null); 
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/80 transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden transform transition-all">
        <div className="pt-8 px-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900 active:scale-90"
          >
            <X size={20} />
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Select Your Size
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Choose an available size for
              <span className="text-purple-600 font-bold ml-1">
                {product.selectedColor}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {filteredVariants.length > 0 ? (
              filteredVariants.map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 active:scale-95 ${
                      isSelected
                        ? "border-purple-600 bg-purple-50 ring-4 ring-purple-50"
                        : "border-slate-100 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className={`text-base font-bold ${isSelected ? "text-purple-700" : "text-slate-900"}`}>
                      {variant.size}
                    </span>
                    
                    {isSelected && (
                      <CheckCircle2 size={14} className="absolute -top-2 -right-2 text-purple-600 fill-white" />
                    )}

                    {variant.variant_stock <= 3 && variant.variant_stock > 0 && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm">
                        Low Stock
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="col-span-3 flex items-center gap-3 p-5 bg-orange-50 border border-orange-100 rounded-2xl text-orange-700 text-[11px] font-bold">
                <AlertCircle size={18} />
                NO SIZES CURRENTLY AVAILABLE FOR THIS COLOR.
              </div>
            )}
          </div>

          <button
            disabled={!selectedVariant}
            onClick={handleConfirmation}
            className="w-full bg-slate-900 hover:bg-purple-600 disabled:bg-slate-100 disabled:text-slate-400 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-xl shadow-slate-200 hover:shadow-purple-200/40 flex items-center justify-center gap-2 group"
          >
            {selectedVariant ? (
              <>
                Confirm & Add to Cart
                <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" />
              </>
            ) : (
              "Please Select A Size"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}