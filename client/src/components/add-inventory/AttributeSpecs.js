"use client";

import { memo } from "react";
import { Layers3, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { renderSpecField } from "@/components/inventory/inventoryFormUtils";

// Props: { isLoadingSpecs, categoryId, isNewCategory, mappedAttributes, fixedSpecificationAttributes, specValues, onSpecChange }
function AttributeSpecs({
  isLoadingSpecs,
  categoryId,
  isNewCategory,
  mappedAttributes,
  fixedSpecificationAttributes,
  specValues,
  onSpecChange,
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
      ) : fixedSpecificationAttributes.length === 0 ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          All mapped attributes are selected for Step 3 variation control.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {fixedSpecificationAttributes.map((attribute) => {
            const value = specValues[attribute.id] || "";

            return (
              <div
                key={attribute.id}
                className="rounded-xl border border-slate-100 bg-white p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-800">
                    {attribute.name}
                  </label>
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

                {renderSpecField({
                  attribute,
                  value,
                  onChange: (nextValue) =>
                    onSpecChange(attribute.id, nextValue),
                })}
              </div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}

export default memo(AttributeSpecs);
