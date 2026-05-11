"use client";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { Trash2 } from "lucide-react";

function SubVariantRow({
  nestIndex,
  subIndex,
  subAttributeDefinitions,
  canRemove,
  onRemove,
}) {
  const { register } = useFormContext();
  const base =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100";

  return (
    <div className="relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="absolute right-2 top-2 z-10">
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="rounded-xl p-2 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-200"
          aria-label="Remove variation"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {subAttributeDefinitions.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {subAttributeDefinitions.map((def, attrIdx) => {
              const options = def.options || [];
              const fieldName = `variantGroups.${nestIndex}.subVariants.${subIndex}.subAttributes.${attrIdx}.value`;

              return (
                <div key={def.id} >
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 truncate">
                      {def.name}
                    </label>
                  </div>
                  <input
                    type="hidden"
                    {...register(
                      `variantGroups.${nestIndex}.subVariants.${subIndex}.subAttributes.${attrIdx}.attributeId`,
                      { valueAsNumber: true },
                    )}
                  />
                  <input
                    list={`sub-opt-${def.id}-${nestIndex}-${subIndex}`}
                    {...register(fieldName)}
                    placeholder={`${def.name}…`}
                    className={base}
                  />
                  <datalist id={`sub-opt-${def.id}-${nestIndex}-${subIndex}`}>
                    {options.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              {...register(
                `variantGroups.${nestIndex}.subVariants.${subIndex}.price`,
              )}
              placeholder="0.00"
              className={base}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Sale price
            </label>
            <input
              type="number"
              step="0.01"
              {...register(
                `variantGroups.${nestIndex}.subVariants.${subIndex}.salePrice`,
              )}
              placeholder="Optional"
              className={base}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Stock
            </label>
            <input
              type="number"
              {...register(
                `variantGroups.${nestIndex}.subVariants.${subIndex}.stock`,
              )}
              placeholder="0"
              className={base}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              SKU
            </label>
            <input
              type="text"
              {...register(
                `variantGroups.${nestIndex}.subVariants.${subIndex}.sku`,
              )}
              placeholder="SKU"
              className={`${base} font-mono text-xs uppercase`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SubVariantRow);
