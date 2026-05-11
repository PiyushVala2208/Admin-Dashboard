"use client";

import { useCallback, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Boxes, Grid2x2Plus, Zap } from "lucide-react";
import PrimaryGroupCard from "@/components/add-inventory/PrimaryGroupCard";
import {
  alignSubVariantAttributeSlots,
  buildSubAttributeCombinations,
  createEmptySubVariant,
  subVariantAttributeKey,
} from "@/components/inventory/inventoryFormUtils";
import { buildSku } from "@/components/variant-matrix/utils";

function HierarchicalVariantMatrix({
  productName,
  selectableAttributes,
  selectedVariationAttributeIds,
  primaryVariationAttributeId,
  onPrimaryVariationAttributeChange,
  onToggleVariationAttribute,
  subAttributeDefinitions,
}) {
  const { control, getValues, setValue, watch } = useFormContext();
  const watchedGroups = watch("variantGroups") || [];

  const { fields } = useFieldArray({
    control,
    name: "variantGroups",
  });

  const attributeMap = useMemo(
    () =>
      new Map(
        (selectableAttributes || []).map((attribute) => [
          Number(attribute.id),
          attribute,
        ]),
      ),
    [selectableAttributes],
  );

  const primaryDefinition = primaryVariationAttributeId
    ? attributeMap.get(Number(primaryVariationAttributeId))
    : null;

  const bulkAutoGenerate = useCallback(() => {
    const groups = getValues("variantGroups") || [];
    if (!groups.length) {
      toast.error("Choose primary options in Step 2 to create groups first.");
      return;
    }
    const combos = buildSubAttributeCombinations(subAttributeDefinitions);
    if (!combos.length) {
      toast.error("Sub-attributes need predefined options to auto-fill rows.");
      return;
    }

    let totalAdded = 0;
    const nextGroups = groups.map((group, nestIndex) => {
      const subIds = subAttributeDefinitions.map((a) => Number(a.id));
      const rows = alignSubVariantAttributeSlots(
        group.subVariants || [],
        subIds,
      );
      const keys = new Set(
        rows.map((r) => subVariantAttributeKey(r.subAttributes)),
      );
      const additions = [];

      combos.forEach((combo) => {
        const key = subVariantAttributeKey(combo);
        if (keys.has(key)) return;
        keys.add(key);
        additions.push({
          ...createEmptySubVariant(subIds),
          subAttributes: combo.map((c) => ({
            attributeId: c.attributeId,
            value: c.value,
          })),
          sku: buildSku(
            productName,
            [
              {
                attributeId: Number(group.primaryAttributeId),
                value: String(group.primaryValue || ""),
              },
              ...combo,
            ],
            rows.length + additions.length,
          ),
        });
      });

      totalAdded += additions.length;
      return {
        ...group,
        subVariants: [...rows, ...additions],
      };
    });

    setValue("variantGroups", nextGroups, {
      shouldDirty: true,
      shouldValidate: false,
    });
    if (totalAdded === 0) {
      toast("All sub-attribute combinations already exist.");
    } else {
      toast.success(`Added ${totalAdded} variation row(s) across all groups.`);
    }
  }, [getValues, productName, setValue, subAttributeDefinitions]);

  const autoFillAllSkus = useCallback(() => {
    const groups = getValues("variantGroups") || [];
    const next = groups.map((group) => {
      const primaryAttr = [
        {
          attributeId: Number(group.primaryAttributeId),
          value: String(group.primaryValue || ""),
        },
      ];
      const rows = (group.subVariants || []).map((row, rowIndex) => ({
        ...row,
        sku: buildSku(
          productName,
          [
            ...primaryAttr,
            ...(row.subAttributes || []).filter((s) =>
              String(s.value || "").trim(),
            ),
          ],
          rowIndex,
        ),
      }));
      return { ...group, subVariants: rows };
    });
    setValue("variantGroups", next, { shouldDirty: true });
    toast.success("SKUs regenerated from product name and attributes.");
  }, [getValues, productName, setValue]);

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#8b3dff] text-white shadow-lg shadow-violet-200">
              <Boxes size={22} />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-slate-950">
                Step 3 — Hierarchical variants
              </h3>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={bulkAutoGenerate}
              disabled={!fields.length || !subAttributeDefinitions.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <Grid2x2Plus size={14} />
              Auto-fill all groups
            </button>
            <button
              type="button"
              onClick={autoFillAllSkus}
              disabled={!fields.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-[#8b3dff] transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Zap size={14} />
              Auto SKU (all)
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            Variation attributes
          </h4>
          {selectableAttributes.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">
              No select-type attributes are mapped for this category.
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
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-700">
                        Required
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {selectedVariationAttributeIds.length >= 2 ? (
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
              Primary grouping attribute
            </label>
            <select
              value={primaryVariationAttributeId ?? ""}
              onChange={(e) =>
                onPrimaryVariationAttributeChange(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              className="mt-2 w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-[#8b3dff] sm:w-auto"
            >
              {selectedVariationAttributeIds.map((id) => {
                const def = attributeMap.get(Number(id));
                if (!def) return null;
                return (
                  <option key={id} value={id}>
                    {def.name}
                  </option>
                );
              })}
            </select>
            <p className="mt-2 text-[11px] font-medium text-slate-500">
              Multi-select for this attribute lives in Step 2 — each option
              becomes a card here. Other selected attributes are edited per row.
            </p>
          </div>
        ) : null}
      </div>

      {!fields.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No variant groups yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500">
            {primaryDefinition ? (
              <>
                In Step 2, use{" "}
                <span className="font-bold text-slate-700">
                  {primaryDefinition.name}
                </span>
                to select one or more options. Each selection appears here as a
                group you can subdivide with sizes or other sub-attributes.
              </>
            ) : (
              "Select at least one variation attribute above, then choose primary options in Step 2."
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {fields.map((field, nestIndex) => {
            const g = watchedGroups[nestIndex] || {};
            const primaryValue = g.primaryValue;
            const primaryId = g.primaryAttributeId;
            const def = attributeMap.get(Number(primaryId));
            const primaryLabel =
              def && primaryValue
                ? `${def.name}: ${primaryValue}`
                : primaryValue || `Group ${nestIndex + 1}`;

            return (
              <PrimaryGroupCard
                key={field.id}
                nestIndex={nestIndex}
                primaryLabel={primaryLabel}
                subAttributeDefinitions={subAttributeDefinitions}
                productName={productName}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HierarchicalVariantMatrix;
