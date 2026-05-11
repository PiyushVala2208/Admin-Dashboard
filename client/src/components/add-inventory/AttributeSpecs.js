"use client";

import { memo } from "react";
import { Layers3, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { renderSpecField } from "@/components/inventory/inventoryFormUtils";

function PrimaryOptionChips({ attribute, selectedValues, onToggle, disabled }) {
  const options = [...new Set((attribute.options || []).map((o) => String(o || "").trim()).filter(Boolean))];

  const toggle = (option) => {
    if (disabled) return;
    const next = new Set(selectedValues);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onToggle(Array.from(next));
  };

  if (!options.length) {
    return (
      <p className="text-xs font-medium text-amber-700">
        This attribute has no predefined options.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selectedValues.includes(option);
        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => toggle(option)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition ${
              active
                ? "border-[#8b3dff] bg-violet-50 text-[#8b3dff] shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function AttributeSpecs({
  isLoadingSpecs,
  categoryId,
  isNewCategory,
  mappedAttributes,
  attributesForStep2,
  specValues,
  onSpecChange,
  primaryVariationAttributeId,
  primaryOptionSelections,
  onPrimaryOptionSelectionsChange,
}) {
  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
      <div className="mb-6 flex items-center gap-2.5 border-b border-slate-100 pb-5 text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">
        <Layers3 size={15} />
        Step 2 - Product Specifications
      </div>

      {isLoadingSpecs ? (
        <div className="flex items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-4 py-12 text-sm text-slate-500">
          <Loader2 size={16} className="mr-2 animate-spin" />
          Loading category specifications...
        </div>
      ) : !categoryId ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          {isNewCategory
            ? "New category selected. Specifications can be mapped after category creation."
            : "Select a category to configure product specifications."}
        </div>
      ) : mappedAttributes.length === 0 ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          No mapped attributes for this category. You can proceed with variants
          only.
        </div>
      ) : attributesForStep2.length === 0 ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          No attributes to show for this step.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {attributesForStep2.map((attribute) => {
            const isPrimaryMulti =
              Number(attribute.id) === Number(primaryVariationAttributeId);
            const value = specValues[attribute.id] || "";
            const chipValues = Array.isArray(primaryOptionSelections[attribute.id])
              ? primaryOptionSelections[attribute.id]
              : [];

            return (
              <div
                key={attribute.id}
                className={`rounded-xl border p-4 ${
                  isPrimaryMulti
                    ? "border-violet-200 bg-violet-50/40 ring-1 ring-violet-100"
                    : "border-slate-100 bg-white"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-800">
                    {attribute.name}
                  </label>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {isPrimaryMulti ? (
                      <span className="rounded-full bg-[#8b3dff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                        Primary groups
                      </span>
                    ) : null}
                    {attribute.is_required ? (
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8b3dff]">
                        Required
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                        Optional
                      </span>
                    )}
                  </div>
                </div>

                {isPrimaryMulti ? (
                  <div className="space-y-3">
                    <p className="text-xs font-medium leading-relaxed text-slate-600">
                      Select every option you sell.
                    </p>
                    <PrimaryOptionChips
                      attribute={attribute}
                      selectedValues={chipValues}
                      onToggle={(next) =>
                        onPrimaryOptionSelectionsChange(attribute.id, next)
                      }
                      disabled={!primaryVariationAttributeId}
                    />
                  </div>
                ) : (
                  renderSpecField({
                    attribute,
                    value,
                    onChange: (nextValue) => onSpecChange(attribute.id, nextValue),
                  })
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}

export default memo(AttributeSpecs);
