"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/app/utils/api";
import { useCategories } from "@/context/CategoryContext";
import EditInventoryHeader from "./EditInventoryHeader";
import EditInventoryBasicInfoSection from "./EditInventoryBasicInfoSection";
import EditInventorySpecsSection from "./EditInventorySpecsSection";
import EditInventoryVariantMatrixSection from "./EditInventoryVariantMatrixSection";
import EditInventoryFooterActions from "./EditInventoryFooterActions";
import InventoryFormErrorAlert from "@/components/inventory/InventoryFormErrorAlert";
import {
  buildAutoSku,
  buildVariantCombinations,
  createEmptyVariant,
  createVariantKey,
  normalizeCategoryName,
  normalizeSpecValue,
  syncVariantsForSelection,
} from "@/components/inventory/inventoryFormUtils";

const resolveCategoryId = (item, categories) => {
  const directId =
    item?.categoryId ||
    item?.category_id ||
    item?.category?.id ||
    item?.category?.category_id;

  if (directId) {
    return String(directId);
  }

  const categoryName = String(
    item?.category_name || item?.category?.name || item?.category || "",
  );
  const normalized = normalizeCategoryName(categoryName).toLowerCase();
  if (!normalized) return "";

  const matched = (categories || []).find(
    (category) =>
      normalizeCategoryName(category?.name || "").toLowerCase() === normalized,
  );

  return matched?.id ? String(matched.id) : "";
};

const normalizeVariantPayload = (variant = {}, index = 0) => {
  const images = Array.isArray(variant.images)
    ? variant.images
    : Array.isArray(variant.variant_images)
      ? variant.variant_images
      : [variant.variant_image || variant.image];

  const variantAttributes = Array.isArray(variant.variant_attributes)
    ? variant.variant_attributes
    : Array.isArray(variant.attributes)
      ? variant.attributes
      : [];

  const normalizedAttributes = variantAttributes
    .map((entry) => ({
      attributeId: Number(entry.attributeId ?? entry.attribute_id),
      value: String(entry.value || "").trim(),
    }))
    .filter(
      (entry) => Number.isInteger(entry.attributeId) && entry.attributeId > 0,
    );

  return {
    id: String(
      variant.id || variant.variant_id || `variant-${Date.now()}-${index}`,
    ),
    variant_attributes: normalizedAttributes,
    price: String(variant.price ?? variant.variant_price ?? ""),
    stock: String(variant.stock ?? variant.variant_stock ?? ""),
    sku: String(variant.sku || "").trim(),
    images: [
      ...new Set(
        images.map((image) => String(image || "").trim()).filter(Boolean),
      ),
    ],
  };
};

const buildInitialSpecValues = (item) => {
  const map = {};
  const specifications = Array.isArray(item?.specifications)
    ? item.specifications
    : Array.isArray(item?.product_specifications)
      ? item.product_specifications
      : [];

  specifications.forEach((entry) => {
    const attributeId = Number(entry.attributeId ?? entry.attribute_id);
    if (!Number.isInteger(attributeId) || attributeId <= 0) return;
    map[attributeId] = String(entry.value || "");
  });

  return map;
};

export default function EditInventoryModal({
  isOpen,
  onClose,
  item,
  onUpdate,
}) {
  const {
    categories,
    loading: categoriesLoading,
    refreshCategories,
  } = useCategories();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    categoryInput: "",
    description: "",
  });
  const [mappedAttributes, setMappedAttributes] = useState([]);
  const [specValues, setSpecValues] = useState({});
  const [selectedVariationAttributeIds, setSelectedVariationAttributeIds] =
    useState([]);
  const [variants, setVariants] = useState([createEmptyVariant()]);

  const hydratedItemRef = useRef(null);

  const categoryNameMap = useMemo(
    () =>
      new Map(
        (categories || []).map((category) => [
          normalizeCategoryName(category?.name || "").toLowerCase(),
          category,
        ]),
      ),
    [categories],
  );

  const selectedVariationIdSet = useMemo(
    () => new Set(selectedVariationAttributeIds.map((id) => Number(id))),
    [selectedVariationAttributeIds],
  );

  const selectableVariationAttributes = useMemo(
    () => mappedAttributes.filter((attribute) => attribute.type === "select"),
    [mappedAttributes],
  );

  const fixedSpecificationAttributes = useMemo(
    () =>
      mappedAttributes.filter(
        (attribute) => !selectedVariationIdSet.has(Number(attribute.id)),
      ),
    [mappedAttributes, selectedVariationIdSet],
  );

  useEffect(() => {
    if (!isOpen || !item) return;

    if (hydratedItemRef.current === item.id && formData.name) return;

    const categoryInput = String(
      item.category_name || item.category?.name || item.category || "",
    );
    const categoryId = resolveCategoryId(item, categories);

    const itemVariants = Array.isArray(item.variants)
      ? item.variants.map((variant, index) =>
          normalizeVariantPayload(variant, index),
        )
      : [];

    const variationFromPayload = Array.isArray(item.variationAttributeIds)
      ? item.variationAttributeIds
      : Array.isArray(item.variation_attribute_ids)
        ? item.variation_attribute_ids
        : [];

    const variationFromVariants = [
      ...new Set(
        itemVariants
          .flatMap((variant) => variant.variant_attributes || [])
          .map((entry) => Number(entry.attributeId))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    ];

    const seedVariationIds =
      variationFromPayload.length > 0
        ? variationFromPayload
        : variationFromVariants;

    setFormData({
      name: String(item.name || ""),
      categoryId,
      categoryInput,
      description: String(item.description || ""),
    });
    setSpecValues(buildInitialSpecValues(item));
    setSelectedVariationAttributeIds(seedVariationIds.map((id) => Number(id)));
    setVariants(
      itemVariants.length > 0 ? itemVariants : [createEmptyVariant()],
    );
    setFormError("");
    hydratedItemRef.current = item.id;
  }, [categories, formData.name, isOpen, item]);

  useEffect(() => {
    if (!isOpen) {
      hydratedItemRef.current = null;
      return;
    }

    if (categories.length === 0 && !categoriesLoading) {
      refreshCategories();
    }
  }, [categories.length, categoriesLoading, isOpen, refreshCategories]);

  useEffect(() => {
    if (!isOpen) return;

    if (!formData.categoryId) {
      setMappedAttributes([]);
      setSpecValues({});
      setSelectedVariationAttributeIds([]);
      setVariants([createEmptyVariant()]);
      return;
    }

    let active = true;

    const fetchCategoryAttributes = async () => {
      setIsLoadingSpecs(true);
      setFormError("");

      try {
        const response = await api.get(
          `/attributes/category/${formData.categoryId}`,
        );
        const attributes = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        if (!active) return;
        setMappedAttributes(attributes);
        setSpecValues((current) => {
          const next = {};
          attributes.forEach((attribute) => {
            next[attribute.id] = current[attribute.id] || "";
          });
          return next;
        });
      } catch (error) {
        if (!active) return;
        setMappedAttributes([]);
        setSpecValues({});
        const message =
          error?.message || "Unable to load category specifications.";
        setFormError(message);
        toast.error(message);
      } finally {
        if (active) setIsLoadingSpecs(false);
      }
    };

    fetchCategoryAttributes();

    return () => {
      active = false;
    };
  }, [formData.categoryId, isOpen]);

  useEffect(() => {
    const allowedIds = new Set(
      selectableVariationAttributes.map((attribute) => Number(attribute.id)),
    );

    setSelectedVariationAttributeIds((current) =>
      current.filter((id) => allowedIds.has(Number(id))),
    );
  }, [selectableVariationAttributes]);

  useEffect(() => {
    const selectedIds = selectedVariationAttributeIds.map((id) => Number(id));
    setVariants((current) => syncVariantsForSelection(current, selectedIds));
  }, [selectedVariationAttributeIds]);

  const handleFieldChange = (field, value) => {
    setFormError("");
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleCategoryInputChange = (value) => {
    setFormError("");
    const rawValue = String(value || "");
    const normalized = normalizeCategoryName(rawValue).toLowerCase();
    const matchedCategory = categoryNameMap.get(normalized);

    if (matchedCategory) {
      const nextCategoryId = String(matchedCategory.id);
      const categoryChanged = nextCategoryId !== formData.categoryId;

      setFormData((current) => ({
        ...current,
        categoryInput: matchedCategory.name,
        categoryId: nextCategoryId,
      }));

      if (categoryChanged) {
        setSpecValues({});
        setSelectedVariationAttributeIds([]);
        setVariants([createEmptyVariant()]);
      }

      return;
    }

    setFormData((current) => ({
      ...current,
      categoryInput: rawValue,
      categoryId: "",
    }));
    setSpecValues({});
    setSelectedVariationAttributeIds([]);
    setVariants([createEmptyVariant()]);
  };

  const handleSpecChange = (attributeId, value) => {
    setFormError("");
    setSpecValues((current) => ({
      ...current,
      [attributeId]: value,
    }));
  };

  const toggleVariationAttribute = (attributeId) => {
    setFormError("");
    setSelectedVariationAttributeIds((current) =>
      current.includes(attributeId)
        ? current.filter((id) => id !== attributeId)
        : [...current, attributeId],
    );
  };

  const handleAutoGenerateMatrix = () => {
    setFormError("");

    const selectedAttributes = selectedVariationAttributeIds
      .map((id) =>
        selectableVariationAttributes.find(
          (attribute) => Number(attribute.id) === Number(id),
        ),
      )
      .filter(Boolean);

    if (selectedAttributes.length === 0) {
      setFormError("Choose at least one variation attribute first.");
      return;
    }

    const missingOptions = selectedAttributes.find(
      (attribute) =>
        !Array.isArray(attribute.options) || attribute.options.length === 0,
    );

    if (missingOptions) {
      setFormError(
        `${missingOptions.name} has no options. Add options or create variants manually.`,
      );
      return;
    }

    const combinations = buildVariantCombinations(selectedAttributes);
    const existingKeys = new Set(
      variants.map((variant) => createVariantKey(variant.variant_attributes)),
    );

    const additions = combinations
      .filter((combination) => !existingKeys.has(combination.id))
      .map((combination, index) => ({
        ...createEmptyVariant(
          `matrix-${combination.id}-${Date.now()}-${index}`,
          combination.variant_attributes,
        ),
        sku: buildAutoSku(
          formData.name,
          combination.variant_attributes,
          variants.length + index,
        ),
      }));

    if (additions.length === 0) {
      setFormError("All matrix combinations already exist.");
      return;
    }

    setVariants((current) => [...current, ...additions]);
  };

  const blockingValidationMessage = useMemo(() => {
    if (!formData.name.trim()) return "Product name is required.";
    if (!normalizeCategoryName(formData.categoryInput))
      return "Category is required.";

    for (const attribute of fixedSpecificationAttributes) {
      const value = normalizeSpecValue(specValues[attribute.id]);
      if (attribute.is_required && !value) {
        return `${attribute.name} is required.`;
      }
      if (value && attribute.type === "number" && Number.isNaN(Number(value))) {
        return `${attribute.name} must be a valid number.`;
      }
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return "At least one variant is required.";
    }

    const duplicateIdentitySet = new Set();

    for (const [index, variant] of variants.entries()) {
      const variantAttributes = Array.isArray(variant.variant_attributes)
        ? variant.variant_attributes
        : [];
      const label =
        variantAttributes
          .map((entry) => String(entry.value || "").trim())
          .filter(Boolean)
          .join(" / ") || `Variant ${index + 1}`;

      if (variant.price === "") return `${label}: price is required.`;
      if (variant.stock === "") return `${label}: stock is required.`;

      for (const selectedAttributeId of selectedVariationAttributeIds) {
        const definition = selectableVariationAttributes.find(
          (attribute) => Number(attribute.id) === Number(selectedAttributeId),
        );
        const selectedValue = String(
          variantAttributes.find(
            (entry) =>
              Number(entry.attributeId) === Number(selectedAttributeId),
          )?.value || "",
        ).trim();

        if (!definition) {
          return `${label}: contains an unmapped variation attribute.`;
        }

        if (!selectedValue) {
          return `${label}: ${definition.name} value is required.`;
        }
      }

      const sku = String(variant.sku || "")
        .trim()
        .toUpperCase();
      if (!sku) return `${label}: SKU is required.`;

      const combinationKey = createVariantKey(
        variantAttributes.filter((entry) =>
          selectedVariationIdSet.has(Number(entry.attributeId)),
        ),
      );

      const identity = `${combinationKey}||${sku}`;
      if (duplicateIdentitySet.has(identity)) {
        return "Two variants share the same combination and SKU. Make one unique.";
      }
      duplicateIdentitySet.add(identity);
    }

    return "";
  }, [
    fixedSpecificationAttributes,
    formData.categoryInput,
    formData.name,
    selectableVariationAttributes,
    selectedVariationAttributeIds,
    selectedVariationIdSet,
    specValues,
    variants,
  ]);

  const handleShowValidationMessage = () => {
    if (!blockingValidationMessage) return;
    toast.error(blockingValidationMessage);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (blockingValidationMessage) {
      setFormError(blockingValidationMessage);
      toast.error(blockingValidationMessage);
      return;
    }

    setIsSubmitting(true);
    const savingToastId = toast.loading("Saving...");

    try {
      const specificationsPayload = fixedSpecificationAttributes
        .map((attribute) => {
          const value = normalizeSpecValue(specValues[attribute.id]);
          if (!value) return null;
          return {
            attributeId: Number(attribute.id),
            value,
          };
        })
        .filter(Boolean);

      const variantsPayload = variants.map((variant) => ({
        id: Number.isFinite(Number(variant.id))
          ? Number(variant.id)
          : undefined,
        variant_attributes: Array.isArray(variant.variant_attributes)
          ? variant.variant_attributes
              .map((entry) => ({
                attributeId: Number(entry.attributeId),
                value: String(entry.value || "").trim(),
              }))
              .filter(
                (entry) =>
                  Number.isInteger(entry.attributeId) && entry.attributeId > 0,
              )
          : [],
        price: Number.parseFloat(variant.price) || 0,
        stock: Number.parseInt(variant.stock, 10) || 0,
        sku: String(variant.sku || "").trim(),
        images: Array.isArray(variant.images)
          ? variant.images
              .map((image) => String(image || "").trim())
              .filter(Boolean)
          : [],
      }));

      const payload = {
        name: formData.name.trim(),
        category: normalizeCategoryName(formData.categoryInput),
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        description: formData.description.trim(),
        image:
          variantsPayload.find((variant) => variant.images[0])?.images?.[0] ||
          null,
        hasVariants: variantsPayload.length > 1,
        specifications: specificationsPayload,
        variants: variantsPayload,
        variationAttributeIds: selectedVariationAttributeIds.map((id) =>
          Number(id),
        ),
      };

      const response = await api.put(`/inventory/${item.id}`, payload);
      const updatedItem = response.data?.data || response.data || null;

      toast.dismiss(savingToastId);
      toast.success("Product Updated");

      if (typeof onUpdate === "function") {
        onUpdate(updatedItem);
      }
      onClose();
    } catch (error) {
      const message = error?.message || "Unable to update product right now.";
      setFormError(message);
      toast.dismiss(savingToastId);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-2 md:p-6">
      <div className="flex max-h-[98vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-white/20 bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]">
        <EditInventoryHeader onClose={onClose} />

        <div className="flex-1 space-y-8 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 md:p-10">
          <form
            id="luxury-edit-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <EditInventoryBasicInfoSection
              formData={formData}
              categories={categories}
              categoriesLoading={categoriesLoading}
              onFieldChange={handleFieldChange}
              onCategoryInputChange={handleCategoryInputChange}
            />

            <EditInventorySpecsSection
              isLoadingSpecs={isLoadingSpecs}
              categoryId={formData.categoryId}
              mappedAttributes={mappedAttributes}
              fixedSpecificationAttributes={fixedSpecificationAttributes}
              specValues={specValues}
              onSpecChange={handleSpecChange}
            />

            <EditInventoryVariantMatrixSection
              productName={formData.name}
              selectableAttributes={selectableVariationAttributes}
              selectedVariationAttributeIds={selectedVariationAttributeIds}
              onToggleVariationAttribute={toggleVariationAttribute}
              variants={variants}
              setVariants={setVariants}
              onAutoGenerateMatrix={handleAutoGenerateMatrix}
            />

            <InventoryFormErrorAlert message={formError} />
          </form>
        </div>

        <EditInventoryFooterActions
          blockingValidationMessage={blockingValidationMessage}
          isSubmitting={isSubmitting}
          isLoadingSpecs={isLoadingSpecs}
          onClose={onClose}
          onShowValidationMessage={handleShowValidationMessage}
        />
      </div>
    </div>
  );
}
