"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "@/app/utils/api";
import { useCategories } from "@/context/CategoryContext";
import ProductBasicInfo from "@/components/add-inventory/ProductBasicInfo";
import AttributeSpecs from "@/components/add-inventory/AttributeSpecs";
import VariantMatrixSection from "@/components/add-inventory/VariantMatrixSection";
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

export default function AddItemPage() {
  const router = useRouter();
  const { categories, loading, refreshCategories } = useCategories();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    categoryInput: "",
    isNewCategory: false,
    description: "",
  });
  const [mappedAttributes, setMappedAttributes] = useState([]);
  const [specValues, setSpecValues] = useState({});
  const [selectedVariationAttributeIds, setSelectedVariationAttributeIds] =
    useState([]);
  const [variants, setVariants] = useState([createEmptyVariant()]);

  const categoryNameMap = useMemo(
    () =>
      new Map(
        categories.map((category) => [
          normalizeCategoryName(category.name).toLowerCase(),
          category,
        ]),
      ),
    [categories],
  );

  const exactCategoryMatch = useMemo(() => {
    const normalizedInput = normalizeCategoryName(formData.categoryInput).toLowerCase();
    if (!normalizedInput) return null;
    return categoryNameMap.get(normalizedInput) || null;
  }, [formData.categoryInput, categoryNameMap]);

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

  const filteredCategorySuggestions = useMemo(() => {
    const query = normalizeCategoryName(formData.categoryInput).toLowerCase();
    if (!query) return [];

    return categories
      .filter((category) =>
        normalizeCategoryName(category.name).toLowerCase().includes(query),
      )
      .slice(0, 5);
  }, [categories, formData.categoryInput]);

  const hasCreatableCategory =
    !exactCategoryMatch && normalizeCategoryName(formData.categoryInput).length > 0;

  useEffect(() => {
    if (exactCategoryMatch && String(exactCategoryMatch.id) !== formData.categoryId) {
      setFormData((current) => ({
        ...current,
        categoryId: String(exactCategoryMatch.id),
        isNewCategory: false,
      }));
    }
  }, [exactCategoryMatch, formData.categoryId]);

  useEffect(() => {
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
        const response = await api.get(`/attributes/category/${formData.categoryId}`);
        const attributes = Array.isArray(response.data?.data) ? response.data.data : [];

        if (!active) return;
        setMappedAttributes(attributes);
        setSpecValues((previous) => {
          const next = {};
          attributes.forEach((attribute) => {
            next[attribute.id] = previous[attribute.id] || "";
          });
          return next;
        });
      } catch (error) {
        if (!active) return;
        setMappedAttributes([]);
        setSpecValues({});
        const message = error?.message || "Unable to load category specifications right now.";
        setFormError(message);
        toast.error(message);
      } finally {
        if (active) {
          setIsLoadingSpecs(false);
        }
      }
    };

    fetchCategoryAttributes();

    return () => {
      active = false;
    };
  }, [formData.categoryId]);

  useEffect(() => {
    const availableIds = new Set(
      selectableVariationAttributes.map((attribute) => Number(attribute.id)),
    );

    setSelectedVariationAttributeIds((current) =>
      current.filter((id) => availableIds.has(Number(id))),
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
    const normalizedInput = normalizeCategoryName(rawValue);

    if (!normalizedInput) {
      setFormData((current) => ({
        ...current,
        categoryId: "",
        categoryInput: "",
        isNewCategory: false,
      }));
      return;
    }

    const matchedCategory = categoryNameMap.get(normalizedInput.toLowerCase());
    if (matchedCategory) {
      setFormData((current) => ({
        ...current,
        categoryId: String(matchedCategory.id),
        categoryInput: matchedCategory.name,
        isNewCategory: false,
      }));
      return;
    }

    setFormData((current) => ({
      ...current,
      categoryId: "",
      categoryInput: rawValue,
      isNewCategory: true,
    }));
  };

  const handleChooseSuggestion = (category) => {
    setFormError("");
    setFormData((current) => ({
      ...current,
      categoryId: String(category.id),
      categoryInput: category.name,
      isNewCategory: false,
    }));
  };

  const handleCreateCategorySelection = () => {
    const normalizedName = normalizeCategoryName(formData.categoryInput);
    if (!normalizedName) return;
    setFormData((current) => ({
      ...current,
      categoryId: "",
      categoryInput: normalizedName,
      isNewCategory: true,
    }));
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

    const missingOptionsAttribute = selectedAttributes.find(
      (attribute) =>
        !Array.isArray(attribute.options) || attribute.options.length === 0,
    );
    if (missingOptionsAttribute) {
      setFormError(
        `${missingOptionsAttribute.name} has no predefined options. Add options or create variants manually.`,
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
      setFormError("All matrix combinations already exist in the variant list.");
      return;
    }

    setVariants((current) => [...current, ...additions]);
  };

  const validatePayload = () => {
    if (!formData.name.trim()) return "Product name is required.";
    if (!normalizeCategoryName(formData.categoryInput)) return "Category is required.";

    for (const attribute of fixedSpecificationAttributes) {
      const value = normalizeSpecValue(specValues[attribute.id]);
      if (attribute.is_required && !value) return `${attribute.name} is required.`;
      if (value && attribute.type === "number" && Number.isNaN(Number(value))) {
        return `${attribute.name} must be a valid number.`;
      }
    }

    if (variants.length === 0) return "At least one variant is required.";

    const duplicateIdentitySet = new Set();
    for (const [index, variant] of variants.entries()) {
      const normalizedVariantAttributes = Array.isArray(variant.variant_attributes)
        ? variant.variant_attributes
        : [];
      const label =
        normalizedVariantAttributes
          .map((item) => String(item.value || "").trim())
          .filter(Boolean)
          .join(" / ") || `Variant ${index + 1}`;

      if (variant.price === "") return `${label}: price is required.`;
      if (variant.stock === "") return `${label}: stock is required.`;

      for (const selectedAttributeId of selectedVariationAttributeIds) {
        const attributeDefinition = selectableVariationAttributes.find(
          (attribute) => Number(attribute.id) === Number(selectedAttributeId),
        );
        const attributeValue = String(
          normalizedVariantAttributes.find(
            (item) => Number(item.attributeId) === Number(selectedAttributeId),
          )?.value || "",
        ).trim();
        if (!attributeDefinition) {
          return `${label}: contains an unmapped variation attribute.`;
        }
        if (!attributeValue) {
          return `${label}: ${attributeDefinition.name} value is required.`;
        }
      }

      const sku = String(variant.sku || "").trim().toUpperCase();
      if (!sku) return `${label}: SKU is required.`;

      const combinationKey = createVariantKey(
        normalizedVariantAttributes.filter((item) =>
          selectedVariationIdSet.has(Number(item.attributeId)),
        ),
      );
      const identity = `${combinationKey}||${sku}`;
      if (duplicateIdentitySet.has(identity)) {
        return "Two variants share the exact same attribute combination and SKU. Make one unique.";
      }
      duplicateIdentitySet.add(identity);
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const validationMessage = validatePayload();
    if (validationMessage) {
      setFormError(validationMessage);
      toast.error(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const specificationsPayload = fixedSpecificationAttributes
        .map((attribute) => {
          const rawValue = normalizeSpecValue(specValues[attribute.id]);
          if (!rawValue) return null;
          return {
            attributeId: Number(attribute.id),
            value: rawValue,
          };
        })
        .filter(Boolean);

      const variantsPayload = variants.map((variant) => ({
        variant_attributes: Array.isArray(variant.variant_attributes)
          ? variant.variant_attributes
              .map((item) => ({
                attributeId: Number(item.attributeId),
                value: String(item.value || "").trim(),
              }))
              .filter(
                (item) => Number.isInteger(item.attributeId) && item.attributeId > 0,
              )
          : [],
        price: Number.parseFloat(variant.price) || 0,
        stock: Number.parseInt(variant.stock, 10) || 0,
        sku: String(variant.sku || "").trim(),
        images: Array.isArray(variant.images)
          ? variant.images.map((image) => String(image || "").trim()).filter(Boolean)
          : [],
      }));

      const payload = {
        name: formData.name.trim(),
        category: normalizeCategoryName(formData.categoryInput),
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        description: formData.description.trim(),
        image:
          variantsPayload.find((variant) => variant.images[0])?.images?.[0] || null,
        hasVariants: variantsPayload.length > 1,
        specifications: specificationsPayload,
        variants: variantsPayload,
        variationAttributeIds: selectedVariationAttributeIds.map((id) => Number(id)),
      };

      await api.post("/inventory", payload);
      toast.success("Product saved successfully.");
      await refreshCategories();
      router.push("/inventory/all");
    } catch (error) {
      const message =
        error?.message || error?.error || "Unable to save this product right now.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-violet-100 px-4 py-8 md:px-6 md:py-10 lg:px-10">
      <form onSubmit={handleSubmit} className="mx-auto max-w-[1400px] space-y-8">
        <section className="overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-100 bg-violet-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#8b3dff]">
              <Sparkles size={14} className="stroke-[2.5]" />
              Catalog Manager
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 md:text-4xl lg:leading-tight">
              Add New Product
            </h2>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-8">
            <ProductBasicInfo
              formData={formData}
              loading={loading}
              categories={categories}
              filteredCategorySuggestions={filteredCategorySuggestions}
              hasCreatableCategory={hasCreatableCategory}
              exactCategoryMatch={exactCategoryMatch}
              onFieldChange={handleFieldChange}
              onCategoryInputChange={handleCategoryInputChange}
              onChooseSuggestion={handleChooseSuggestion}
              onCreateCategorySelection={handleCreateCategorySelection}
            />
          </aside>

          <div className="space-y-8">
            <AttributeSpecs
              isLoadingSpecs={isLoadingSpecs}
              categoryId={formData.categoryId}
              isNewCategory={formData.isNewCategory}
              mappedAttributes={mappedAttributes}
              fixedSpecificationAttributes={fixedSpecificationAttributes}
              specValues={specValues}
              onSpecChange={handleSpecChange}
            />

            <VariantMatrixSection
              productName={formData.name}
              selectableAttributes={selectableVariationAttributes}
              selectedVariationAttributeIds={selectedVariationAttributeIds}
              onToggleVariationAttribute={toggleVariationAttribute}
              variants={variants}
              setVariants={setVariants}
              onAutoGenerateMatrix={handleAutoGenerateMatrix}
            />

            <InventoryFormErrorAlert message={formError} />

            <div className="flex justify-end border-t border-slate-200 pt-5">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingSpecs}
                className="inline-flex w-full min-w-60 items-center justify-center gap-3.5 rounded-2xl bg-slate-950 px-8 py-4 text-base font-bold text-white shadow-lg shadow-slate-950/10 transition hover:bg-[#8b3dff] disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                    Adding Product...
                  </>
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
