"use client";

import { memo } from "react";
import { Package2 } from "lucide-react";
import DynamicVariantMatrix from "@/components/variant-matrix/components/DynamicVariantMatrix";

// Props: { productName, selectableAttributes, selectedVariationAttributeIds, onToggleVariationAttribute, variants, setVariants, onAutoGenerateMatrix }
function VariantMatrixSection({
  productName,
  selectableAttributes,
  selectedVariationAttributeIds,
  onToggleVariationAttribute,
  variants,
  setVariants,
  onAutoGenerateMatrix,
}) {
  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6 overflow-x-hidden">
      <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-4 text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">
        <Package2 size={15} />
        Step 3 - Variant Matrix
      </div>

      <DynamicVariantMatrix
        productName={productName}
        selectableAttributes={selectableAttributes}
        selectedVariationAttributeIds={selectedVariationAttributeIds}
        onToggleVariationAttribute={onToggleVariationAttribute}
        variants={variants}
        setVariants={setVariants}
        onAutoGenerateMatrix={onAutoGenerateMatrix}
      />
    </section>
  );
}

export default memo(VariantMatrixSection);
