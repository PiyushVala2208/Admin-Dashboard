"use client";

import { memo, useCallback } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Image as ImageIcon, Plus, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import SubVariantRow from "@/components/add-inventory/SubVariantRow";
import {
  buildSubAttributeCombinations,
  createEmptySubVariant,
  subVariantAttributeKey,
} from "@/components/inventory/inventoryFormUtils";
import { buildSku } from "@/components/variant-matrix/utils";

function PrimaryGroupCard({
  nestIndex,
  primaryLabel,
  subAttributeDefinitions,
  productName,
}) {
  const { control, setValue, watch, getValues } = useFormContext();
  const primaryAttributeId = watch(`variantGroups.${nestIndex}.primaryAttributeId`);
  const primaryValue = watch(`variantGroups.${nestIndex}.primaryValue`);
  const groupImage = watch(`variantGroups.${nestIndex}.groupImage`);

  const subIds = subAttributeDefinitions.map((a) => Number(a.id));

  const { fields, append, remove } = useFieldArray({
    control,
    name: `variantGroups.${nestIndex}.subVariants`,
  });

  const handleImagePick = useCallback(
    (file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        if (dataUrl) setValue(`variantGroups.${nestIndex}.groupImage`, dataUrl);
      };
      reader.onerror = () => toast.error("Unable to read image.");
      reader.readAsDataURL(file);
    },
    [nestIndex, setValue],
  );

  const existingSubKeys = useCallback(() => {
    const rows = getValues(`variantGroups.${nestIndex}.subVariants`) || [];
    return new Set(rows.map((r) => subVariantAttributeKey(r.subAttributes)));
  }, [getValues, nestIndex]);

  const appendGeneratedRows = useCallback(() => {
    const combos = buildSubAttributeCombinations(subAttributeDefinitions);
    if (!combos.length) {
      toast.error(
        "Define options on sub-attributes (e.g. Sizes) in the catalog to auto-generate rows.",
      );
      return;
    }
    const keys = existingSubKeys();
    let added = 0;
    combos.forEach((combo) => {
      const key = subVariantAttributeKey(combo);
      if (keys.has(key)) return;
      keys.add(key);
      append({
        ...createEmptySubVariant(subIds),
        subAttributes: combo.map((c) => ({ attributeId: c.attributeId, value: c.value })),
        sku: buildSku(
          productName,
          [
            { attributeId: Number(primaryAttributeId), value: String(primaryValue || "") },
            ...combo,
          ],
          fields.length + added,
        ),
      });
      added += 1;
    });
    if (added === 0) toast("All option combinations already exist for this group.");
    else toast.success(`Added ${added} variation row(s).`);
  }, [
    append,
    existingSubKeys,
    fields.length,
    primaryAttributeId,
    primaryValue,
    productName,
    subAttributeDefinitions,
    subIds,
  ]);

  const handleAddVariation = useCallback(() => {
    append(createEmptySubVariant(subIds));
  }, [append, subIds]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50/90 shadow-sm"
    >
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Primary group
            </p>
            <h4 className="mt-1 text-lg font-black tracking-tight text-slate-900">
              {primaryLabel}
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={appendGeneratedRows}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-800 transition hover:bg-emerald-100"
            >
              <Wand2 size={14} />
              Fill from options
            </button>
            <button
              type="button"
              onClick={handleAddVariation}
              className="inline-flex items-center gap-2 rounded-xl bg-[#8b3dff] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-violet-600"
            >
              <Plus size={15} />
              Add variation
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,200px)_1fr] lg:items-start">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Group image
          </p>
          <div className="group relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-violet-300 lg:mx-0">
            {groupImage ? (
              <img
                src={groupImage}
                alt={primaryLabel}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 text-slate-400">
                <ImageIcon size={28} />
                <span className="px-2 text-center text-[10px] font-black uppercase tracking-wider">
                  Upload for this color
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => handleImagePick(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          {fields.map((field, subIndex) => (
            <SubVariantRow
              key={field.id}
              nestIndex={nestIndex}
              subIndex={subIndex}
              subAttributeDefinitions={subAttributeDefinitions}
              canRemove={fields.length > 1}
              onRemove={() => remove(subIndex)}
            />
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export default memo(PrimaryGroupCard);
