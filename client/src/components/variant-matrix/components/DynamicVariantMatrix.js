"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import VariantMatrixHeader from "@/components/variant-matrix/components/VariantMatrixHeader";
import VariantCard from "@/components/variant-matrix/components/VariantCard";
import { buildSku } from "@/components/variant-matrix/utils";

const createManualVariant = (selectedVariationAttributeIds = []) => {
  const timestamp = Date.now();
  return {
    id: `manual-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    variant_attributes: selectedVariationAttributeIds.map((attributeId) => ({
      attributeId: Number(attributeId),
      value: "",
    })),
    price: "",
    stock: "",
    sku: "",
    images: [],
  };
};

export default function DynamicVariantMatrix({
  productName,
  selectableAttributes,
  selectedVariationAttributeIds,
  onToggleVariationAttribute,
  variants,
  setVariants,
  onAutoGenerateMatrix,
}) {
  const cardRefs = useRef(new Map());
  const pendingScrollVariantId = useRef(null);

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

  const attributeNameMap = useMemo(
    () =>
      new Map(
        (selectableAttributes || []).map((attribute) => [
          Number(attribute.id),
          attribute.name,
        ]),
      ),
    [selectableAttributes],
  );

  useEffect(() => {
    if (!pendingScrollVariantId.current) return;

    const target = cardRefs.current.get(pendingScrollVariantId.current);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    pendingScrollVariantId.current = null;
  }, [variants]);

  const registerCardRef = useCallback((variantId, node) => {
    if (!variantId) return;
    if (node) {
      cardRefs.current.set(variantId, node);
    } else {
      cardRefs.current.delete(variantId);
    }
  }, []);

  const handleAddManualVariant = useCallback(() => {
    const newVariant = createManualVariant(selectedVariationAttributeIds);
    pendingScrollVariantId.current = newVariant.id;

    setVariants((current) => {
      const seed = Array.isArray(current) ? current : [];
      return [...seed, newVariant];
    });
  }, [selectedVariationAttributeIds, setVariants]);

  const updateVariantById = useCallback(
    (variantId, updater) => {
      setVariants((current) =>
        (Array.isArray(current) ? current : []).map((variant) => {
          if (variant.id !== variantId) return variant;
          return updater(variant);
        }),
      );
    },
    [setVariants],
  );

  const handleRemoveVariant = useCallback(
    (variantId) => {
      setVariants((current) => {
        const seed = Array.isArray(current) ? current : [];
        if (seed.length <= 1) return seed;
        return seed.filter((variant) => variant.id !== variantId);
      });
    },
    [setVariants],
  );

  const handleAutoFillSku = useCallback(
    (variantId, variantAttributes = [], fallbackIndex = 0) => {
      const generated = buildSku(productName, variantAttributes, fallbackIndex);
      updateVariantById(variantId, (current) => ({
        ...current,
        sku: generated,
      }));
    },
    [productName, updateVariantById],
  );

  const handleAutoFillAllSkus = useCallback(() => {
    setVariants((current) =>
      (Array.isArray(current) ? current : []).map((variant, index) => ({
        ...variant,
        sku: buildSku(productName, variant.variant_attributes, index),
      })),
    );
    toast.success("SKUs generated for all variants.");
  }, [productName, setVariants]);

  const handleImageUpload = useCallback(
    (variantId, file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        if (!dataUrl) return;

        updateVariantById(variantId, (current) => ({
          ...current,
          images: [dataUrl],
        }));
      };
      reader.onerror = () => {
        toast.error("Unable to read selected image.");
      };
      reader.readAsDataURL(file);
    },
    [updateVariantById],
  );

  const handleVariantUpdate = useCallback(
    (variantId, updater) => {
      updateVariantById(variantId, updater);
    },
    [updateVariantById],
  );

  const handleAttributeValueChange = useCallback(
    (variantId, attributeId, value) => {
      updateVariantById(variantId, (current) => ({
        ...current,
        variant_attributes: (current.variant_attributes || []).map((item) =>
          Number(item.attributeId) === Number(attributeId)
            ? { ...item, value }
            : item,
        ),
      }));
    },
    [updateVariantById],
  );

  const safeVariants = Array.isArray(variants) && variants.length > 0
    ? variants
    : [createManualVariant(selectedVariationAttributeIds)];

  return (
    <div className="space-y-6">
      <VariantMatrixHeader
        selectableAttributes={selectableAttributes}
        selectedVariationAttributeIds={selectedVariationAttributeIds}
        onToggleVariationAttribute={onToggleVariationAttribute}
        onAutoGenerateMatrix={onAutoGenerateMatrix}
        onAddManualVariant={handleAddManualVariant}
        onAutoFillAllSkus={handleAutoFillAllSkus}
      />

      <div className="space-y-5">
        <AnimatePresence initial={false}>
          {safeVariants.map((variant, index) => (
            <VariantCard
              key={variant.id || `variant-${index}`}
              variant={variant}
              index={index}
              attributeNameMap={attributeNameMap}
              attributeMap={attributeMap}
              variantsLength={safeVariants.length}
              onAutoFillSku={handleAutoFillSku}
              onRemoveVariant={handleRemoveVariant}
              onImageUpload={handleImageUpload}
              onVariantUpdate={handleVariantUpdate}
              onAttributeValueChange={handleAttributeValueChange}
              cardRef={(node) => registerCardRef(variant.id, node)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
