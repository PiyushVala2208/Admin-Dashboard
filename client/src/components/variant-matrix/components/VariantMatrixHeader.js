"use client";

import { memo } from "react";
import { Boxes, Grid2x2Plus, Plus, Zap } from "lucide-react";

// Props: { selectableAttributes, selectedVariationAttributeIds, onToggleVariationAttribute, onAutoGenerateMatrix, onAddManualVariant, onAutoFillAllSkus }
function VariantMatrixHeader({
  selectableAttributes,
  selectedVariationAttributeIds,
  onToggleVariationAttribute,
  onAutoGenerateMatrix,
  onAddManualVariant,
  onAutoFillAllSkus,
}) {
  return (
    <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8b3dff] text-white shadow-lg shadow-violet-200">
            <Boxes size={22} />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight text-slate-950">
              Variant Matrix
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAutoGenerateMatrix}
            disabled={selectedVariationAttributeIds.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Grid2x2Plus size={14} />
            Auto-Generate Matrix
          </button>
          <button
            type="button"
            onClick={onAddManualVariant}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8b3dff] px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition hover:bg-violet-600"
          >
            <Plus size={15} />
            Add Variant
          </button>
          <button
            type="button"
            onClick={onAutoFillAllSkus}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-[#8b3dff] transition hover:bg-violet-100"
          >
            <Zap size={14} />
            Auto SKU
          </button>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          Select Attributes for Variation
        </h4>

        {selectableAttributes.length === 0 ? (
          <p className="mt-3 text-[10px] text-slate-500">
            No selectable attributes mapped for this category.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2.5">
            {selectableAttributes.map((attribute) => {
              const checked = selectedVariationAttributeIds.includes(
                Number(attribute.id),
              );

              return (
                <label
                  key={attribute.id}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition ${
                    checked
                      ? "border-[#8b3dff] bg-violet-50 text-[#8b3dff]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      onToggleVariationAttribute(Number(attribute.id))
                    }
                    className="h-3.5 w-3.5 accent-[#8b3dff]"
                  />
                  {attribute.name}
                  {attribute.is_required ? (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                      Required
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(VariantMatrixHeader);
