"use client";

import { memo } from "react";
import { Package2 } from "lucide-react";
import DynamicVariantMatrix from "@/components/variant-matrix/components/DynamicVariantMatrix";
import HierarchicalVariantMatrix from "@/components/add-inventory/HierarchicalVariantMatrix";

function VariantMatrixSection({
  useHierarchicalVariants,
  productName,
  selectableAttributes,
  selectedVariationAttributeIds,
  primaryVariationAttributeId,
  onPrimaryVariationAttributeChange,
  onToggleVariationAttribute,
  subAttributeDefinitions,
  variants,
  setVariants,
  onAutoGenerateMatrix,
}) {
  return (
    <section className="overflow-x-hidden rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-4 text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">
        <Package2 size={15} />
        Step 3 - Variant matrix
      </div>

      {useHierarchicalVariants ? (
        <HierarchicalVariantMatrix
          productName={productName}
          selectableAttributes={selectableAttributes}
          selectedVariationAttributeIds={selectedVariationAttributeIds}
          primaryVariationAttributeId={primaryVariationAttributeId}
          onPrimaryVariationAttributeChange={onPrimaryVariationAttributeChange}
          onToggleVariationAttribute={onToggleVariationAttribute}
          subAttributeDefinitions={subAttributeDefinitions}
        />
      ) : (
        <DynamicVariantMatrix
          productName={productName}
          selectableAttributes={selectableAttributes}
          selectedVariationAttributeIds={selectedVariationAttributeIds}
          onToggleVariationAttribute={onToggleVariationAttribute}
          variants={variants}
          setVariants={setVariants}
          onAutoGenerateMatrix={onAutoGenerateMatrix}
        />
      )}
    </section>
  );
}

export default memo(VariantMatrixSection);
