"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Trash2, Zap } from "lucide-react";
import { createVariantLabel } from "@/components/variant-matrix/utils";

// Props: { variant, index, attributeNameMap, attributeMap, variantsLength, onAutoFillSku, onRemoveVariant, onImageUpload, onVariantUpdate, onAttributeValueChange, cardRef }
function VariantCard({
  variant,
  index,
  attributeNameMap,
  attributeMap,
  variantsLength,
  onAutoFillSku,
  onRemoveVariant,
  onImageUpload,
  onVariantUpdate,
  onAttributeValueChange,
  cardRef,
}) {
  const cardTitle = createVariantLabel(
    variant.variant_attributes,
    attributeNameMap,
  );

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Variant {index + 1}
            </p>
            <h5 className="mt-1 text-sm font-black text-slate-900">
              {cardTitle}
            </h5>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onAutoFillSku(variant.id, variant.variant_attributes, index)
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#8b3dff] transition hover:bg-violet-200"
            >
              <Zap size={12} />
              Auto SKU
            </button>
            <button
              type="button"
              onClick={() => onRemoveVariant(variant.id)}
              disabled={variantsLength === 1}
              className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[220px_1fr]">
        <div className="space-y-4">
          <div className="group relative aspect-square w-full max-w-48 overflow-hidden rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-violet-300">
            {variant.images?.[0] ? (
              <img
                src={variant.images[0]}
                alt={cardTitle}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                <ImageIcon size={30} />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Upload Image
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(event) =>
                onImageUpload(variant.id, event.target.files?.[0])
              }
            />
          </div>

          {variant.variant_attributes.length > 0 ? (
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
              {variant.variant_attributes.map((item) => (
                <div
                  key={`${variant.id}-${item.attributeId}`}
                  className="space-y-1"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    {(attributeNameMap.get(Number(item.attributeId)) ||
                      "Attribute") + " Value"}
                  </p>
                  <input
                    list={`variant-options-${item.attributeId}`}
                    value={item.value}
                    onChange={(event) =>
                      onAttributeValueChange(
                        variant.id,
                        item.attributeId,
                        event.target.value,
                      )
                    }
                    placeholder="Choose or type value"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#8b3dff]"
                  />
                  <datalist id={`variant-options-${item.attributeId}`}>
                    {(
                      attributeMap.get(Number(item.attributeId))?.options || []
                    ).map((option) => (
                      <option
                        key={`${variant.id}-${item.attributeId}-${option}`}
                        value={option}
                      />
                    ))}
                  </datalist>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-500">
              Manual variant without mapped variation attributes.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Price
            </label>
            <input
              type="number"
              value={variant.price}
              onChange={(event) =>
                onVariantUpdate(variant.id, (current) => ({
                  ...current,
                  price: event.target.value,
                }))
              }
              placeholder="Enter price"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#8b3dff]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Stock
            </label>
            <input
              type="number"
              value={variant.stock}
              onChange={(event) =>
                onVariantUpdate(variant.id, (current) => ({
                  ...current,
                  stock: event.target.value,
                }))
              }
              placeholder="Enter stock"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#8b3dff]"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              SKU
            </label>
            <input
              type="text"
              value={variant.sku}
              onChange={(event) =>
                onVariantUpdate(variant.id, (current) => ({
                  ...current,
                  sku: event.target.value,
                }))
              }
              placeholder="Enter SKU"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] font-black uppercase text-slate-700 outline-none focus:border-[#8b3dff]"
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default memo(VariantCard);
