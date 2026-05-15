"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import api from "@/app/utils/api";
import { useCategories } from "@/context/CategoryContext";
import ProductBasicInfo from "@/components/add-inventory/ProductBasicInfo";
import AttributeSpecs from "@/components/add-inventory/AttributeSpecs";
import VariantMatrixSection from "@/components/add-inventory/VariantMatrixSection";
import InventoryFormErrorAlert from "@/components/inventory/InventoryFormErrorAlert";
import {
  alignSubVariantAttributeSlots,
  buildAutoSku,
  buildVariantCombinations,
  createEmptySubVariant,
  createEmptyVariant,
  createEmptyVariantGroup,
  createVariantKey,
  flattenVariantGroupsForApi,
  normalizeCategoryName,
  normalizeSpecValue,
  syncVariantsForSelection,
} from "@/components/inventory/inventoryFormUtils";

const DRAFT_STORAGE_KEY = "add_inventory_draft_v1";

export default function AddItemPage() {
  const router = useRouter();
  const { categories, loading, refreshCategories } = useCategories();

  const variantForm = useForm({
    defaultValues: { variantGroups: [] },
  });
  const {
    reset: resetVariantForm,
    getValues: getVariantFormValues,
    watch: watchVariantForm,
  } = variantForm;

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
  const [primaryVariationAttributeId, setPrimaryVariationAttributeId] =
    useState(null);
  const [primaryOptionSelections, setPrimaryOptionSelections] = useState({});
  const [variants, setVariants] = useState([createEmptyVariant()]);
  const didAutoSelectVariationsRef = useRef(false);
  const pendingDraftRef = useRef(null);
  const draftSaveTimeoutRef = useRef(null);
  const watchedVariantGroups = watchVariantForm("variantGroups");

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
    const normalizedInput = normalizeCategoryName(
      formData.categoryInput,
    ).toLowerCase();
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

  const attributesForStep2 = useMemo(() => {
    const primaryId = Number(primaryVariationAttributeId);
    return mappedAttributes.filter((attribute) => {
      const id = Number(attribute.id);
      if (!selectedVariationIdSet.has(id)) return true;
      return Number.isInteger(primaryId) && primaryId > 0 && id === primaryId;
    });
  }, [mappedAttributes, primaryVariationAttributeId, selectedVariationIdSet]);

  const fixedSpecificationAttributes = useMemo(
    () =>
      mappedAttributes.filter(
        (attribute) => !selectedVariationIdSet.has(Number(attribute.id)),
      ),
    [mappedAttributes, selectedVariationIdSet],
  );

  const subVariationAttributeIds = useMemo(
    () =>
      selectedVariationAttributeIds
        .map((id) => Number(id))
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0 &&
            id !== Number(primaryVariationAttributeId),
        ),
    [primaryVariationAttributeId, selectedVariationAttributeIds],
  );

  const subAttributeDefinitions = useMemo(() => {
    const map = new Map(mappedAttributes.map((a) => [Number(a.id), a]));
    return subVariationAttributeIds
      .map((id) => map.get(Number(id)))
      .filter(Boolean);
  }, [mappedAttributes, subVariationAttributeIds]);

  const useHierarchicalVariants = selectedVariationAttributeIds.length >= 1;

  const filteredCategorySuggestions = useMemo(() => {
    const query = normalizeCategoryName(formData.categoryInput).toLowerCase();
    if (!query) return categories.slice(0, 8);

    return categories
      .filter((category) =>
        normalizeCategoryName(category.name).toLowerCase().includes(query),
      )
      .slice(0, 8);
  }, [categories, formData.categoryInput]);

  useEffect(() => {
    if (
      exactCategoryMatch &&
      String(exactCategoryMatch.id) !== formData.categoryId
    ) {
      setFormData((current) => ({
        ...current,
        categoryId: String(exactCategoryMatch.id),
        categoryInput: exactCategoryMatch.name,
        isNewCategory: false,
      }));
    }
  }, [exactCategoryMatch, formData.categoryId]);

  useEffect(() => {
    didAutoSelectVariationsRef.current = false;
    if (!formData.categoryId) {
      setMappedAttributes([]);
      setSpecValues({});
      setSelectedVariationAttributeIds([]);
      setPrimaryVariationAttributeId(null);
      setPrimaryOptionSelections({});
      setVariants([createEmptyVariant()]);
      resetVariantForm({ variantGroups: [] });
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
        const draft = pendingDraftRef.current;
        if (draft) {
          const nextSpecValues = {};
          attributes.forEach((attribute) => {
            const rawValue = draft.specValues?.[attribute.id];
            nextSpecValues[attribute.id] = rawValue ?? "";
          });
          setSpecValues(nextSpecValues);
          setSelectedVariationAttributeIds(
            Array.isArray(draft.selectedVariationAttributeIds)
              ? draft.selectedVariationAttributeIds
              : [],
          );
          setPrimaryVariationAttributeId(
            Number.isInteger(Number(draft.primaryVariationAttributeId))
              ? Number(draft.primaryVariationAttributeId)
              : null,
          );
          setPrimaryOptionSelections(draft.primaryOptionSelections || {});
          setVariants(
            Array.isArray(draft.variants) && draft.variants.length
              ? draft.variants
              : [createEmptyVariant()],
          );
          resetVariantForm({
            variantGroups: Array.isArray(draft.variantGroups)
              ? draft.variantGroups
              : [],
          });
          pendingDraftRef.current = null;
        } else {
          setSpecValues((previous) => {
            const next = {};
            attributes.forEach((attribute) => {
              next[attribute.id] = previous[attribute.id] || "";
            });
            return next;
          });
          setPrimaryOptionSelections({});
          setSelectedVariationAttributeIds([]);
          setPrimaryVariationAttributeId(null);
          resetVariantForm({ variantGroups: [] });
        }
      } catch (error) {
        if (!active) return;
        setMappedAttributes([]);
        setSpecValues({});
        const message =
          error?.message || "Unable to load category specifications right now.";
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
  }, [formData.categoryId, resetVariantForm]);

  useEffect(() => {
    const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!rawDraft) return;
    try {
      const parsed = JSON.parse(rawDraft);
      if (!parsed || typeof parsed !== "object") return;
      pendingDraftRef.current = parsed;
      setFormData((current) => ({
        ...current,
        ...parsed.formData,
      }));
      if (parsed.formData?.categoryId) {
        setFormData((current) => ({
          ...current,
          categoryId: String(parsed.formData.categoryId),
        }));
      }
      setSpecValues(parsed.specValues || {});
      setSelectedVariationAttributeIds(
        Array.isArray(parsed.selectedVariationAttributeIds)
          ? parsed.selectedVariationAttributeIds
          : [],
      );
      setPrimaryVariationAttributeId(
        Number.isInteger(Number(parsed.primaryVariationAttributeId))
          ? Number(parsed.primaryVariationAttributeId)
          : null,
      );
      setPrimaryOptionSelections(parsed.primaryOptionSelections || {});
      setVariants(
        Array.isArray(parsed.variants) && parsed.variants.length
          ? parsed.variants
          : [createEmptyVariant()],
      );
      resetVariantForm({
        variantGroups: Array.isArray(parsed.variantGroups)
          ? parsed.variantGroups
          : [],
      });
    } catch {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [resetVariantForm]);

  useEffect(() => {
    const hasDraftData =
      Boolean(formData.name?.trim()) ||
      Boolean(normalizeCategoryName(formData.categoryInput)) ||
      Object.keys(specValues || {}).length > 0 ||
      selectedVariationAttributeIds.length > 0 ||
      variants.length > 0 ||
      (Array.isArray(watchedVariantGroups) && watchedVariantGroups.length > 0);

    if (!hasDraftData) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
    }

    draftSaveTimeoutRef.current = setTimeout(() => {
      const payload = {
        version: 1,
        savedAt: Date.now(),
        formData,
        specValues,
        selectedVariationAttributeIds,
        primaryVariationAttributeId,
        primaryOptionSelections,
        variants,
        variantGroups: watchedVariantGroups || [],
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    }, 250);

    return () => {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
      }
    };
  }, [
    formData,
    specValues,
    selectedVariationAttributeIds,
    primaryVariationAttributeId,
    primaryOptionSelections,
    variants,
    watchedVariantGroups,
  ]);

  useEffect(() => {
    const availableIds = new Set(
      selectableVariationAttributes.map((attribute) => Number(attribute.id)),
    );

    setSelectedVariationAttributeIds((current) =>
      current.filter((id) => availableIds.has(Number(id))),
    );
  }, [selectableVariationAttributes]);

  useEffect(() => {
    if (didAutoSelectVariationsRef.current) return;
    if (selectedVariationAttributeIds.length > 0) return;
    if (selectableVariationAttributes.length === 0) return;

    didAutoSelectVariationsRef.current = true;
    const nextIds = selectableVariationAttributes
      .map((attribute) => Number(attribute.id))
      .filter((id) => Number.isInteger(id) && id > 0);
    setSelectedVariationAttributeIds(Array.from(new Set(nextIds)));
  }, [selectableVariationAttributes, selectedVariationAttributeIds]);

  useEffect(() => {
    const ids = selectedVariationAttributeIds.map(Number);
    if (!ids.length) {
      setPrimaryVariationAttributeId(null);
      return;
    }
    setPrimaryVariationAttributeId((prev) => {
      if (prev != null && ids.includes(Number(prev))) return prev;
      const firstSelect = ids.find((id) =>
        selectableVariationAttributes.some((a) => Number(a.id) === id),
      );
      return firstSelect != null ? firstSelect : ids[0];
    });
  }, [selectableVariationAttributes, selectedVariationAttributeIds]);

  useEffect(() => {
    setPrimaryOptionSelections((prev) => {
      const pid = Number(primaryVariationAttributeId);
      if (!Number.isInteger(pid) || pid <= 0) return {};
      const kept = prev[pid];
      if (Array.isArray(kept) && kept.length) {
        return { [pid]: kept };
      }
      return {};
    });
  }, [primaryVariationAttributeId]);

  useEffect(() => {
    if (!useHierarchicalVariants || !primaryVariationAttributeId) {
      resetVariantForm({ variantGroups: [] });
      return;
    }

    const primaryId = Number(primaryVariationAttributeId);
    const selected = [
      ...new Set(
        (primaryOptionSelections[primaryId] || [])
          .map((v) => String(v || "").trim())
          .filter(Boolean),
      ),
    ];

    const prevGroups = getVariantFormValues("variantGroups") || [];
    const prevByValue = new Map(
      prevGroups.map((group) => [
        String(group.primaryValue || "").trim(),
        group,
      ]),
    );

    const next = selected.map((primaryValue) => {
      const trimmed = String(primaryValue || "").trim();
      const existing = prevByValue.get(trimmed);
      if (existing && Number(existing.primaryAttributeId) === primaryId) {
        const rows =
          existing.subVariants?.length > 0
            ? existing.subVariants
            : [createEmptySubVariant(subVariationAttributeIds)];
        return {
          ...existing,
          primaryAttributeId: primaryId,
          primaryValue: trimmed,
          subVariants: alignSubVariantAttributeSlots(
            rows,
            subVariationAttributeIds,
          ),
        };
      }
      return createEmptyVariantGroup(
        primaryId,
        trimmed,
        subVariationAttributeIds,
      );
    });

    resetVariantForm({ variantGroups: next });
  }, [
    getVariantFormValues,
    primaryOptionSelections,
    primaryVariationAttributeId,
    resetVariantForm,
    subVariationAttributeIds,
    useHierarchicalVariants,
  ]);

  useEffect(() => {
    if (useHierarchicalVariants) return;
    const selectedIds = selectedVariationAttributeIds.map((id) => Number(id));
    setVariants((current) => syncVariantsForSelection(current, selectedIds));
  }, [selectedVariationAttributeIds, useHierarchicalVariants]);

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
      isNewCategory: false,
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

  const handleSpecChange = (attributeId, value) => {
    setFormError("");
    setSpecValues((current) => ({
      ...current,
      [attributeId]: value,
    }));
  };

  const handlePrimaryOptionSelectionsChange = useCallback(
    (attributeId, values) => {
      setFormError("");
      setPrimaryOptionSelections((current) => ({
        ...current,
        [Number(attributeId)]: values,
      }));
    },
    [],
  );

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
      setFormError(
        "All matrix combinations already exist in the variant list.",
      );
      return;
    }

    setVariants((current) => [...current, ...additions]);
  };

  const validatePayload = () => {
    if (!formData.name.trim()) return "Product name is required.";
    if (!normalizeCategoryName(formData.categoryInput))
      return "Category is required.";
    if (!formData.categoryId)
      return "Please select a valid category from suggestions.";

    for (const attribute of fixedSpecificationAttributes) {
      const value = normalizeSpecValue(specValues[attribute.id]);
      if (attribute.is_required && !value)
        return `${attribute.name} is required.`;
      if (value && attribute.type === "number" && Number.isNaN(Number(value))) {
        return `${attribute.name} must be a valid number.`;
      }
    }

    if (useHierarchicalVariants && primaryVariationAttributeId) {
      const primaryDef = mappedAttributes.find(
        (a) => Number(a.id) === Number(primaryVariationAttributeId),
      );
      const chips =
        primaryOptionSelections[Number(primaryVariationAttributeId)] || [];
      if (primaryDef?.is_required && chips.filter(Boolean).length === 0) {
        return `${primaryDef.name} is required — choose at least one option in Step 2.`;
      }
    }

    const flatVariants = useHierarchicalVariants
      ? flattenVariantGroupsForApi(getVariantFormValues("variantGroups"))
      : variants;

    if (!flatVariants.length) {
      return useHierarchicalVariants
        ? "Add primary options in Step 2 or legacy variant rows."
        : "At least one variant is required.";
    }

    const duplicateIdentitySet = new Set();

    for (const [index, variant] of flatVariants.entries()) {
      const normalizedVariantAttributes = Array.isArray(
        variant.variant_attributes,
      )
        ? variant.variant_attributes
        : [];
      const label =
        normalizedVariantAttributes
          .map((item) => String(item.value || "").trim())
          .filter(Boolean)
          .join(" / ") || `Variant ${index + 1}`;

      if (variant.price === "") return `${label}: price is required.`;
      if (variant.stock === "") return `${label}: stock is required.`;

      const saleRaw = variant.salePrice;
      if (
        saleRaw !== "" &&
        saleRaw !== undefined &&
        saleRaw !== null &&
        (Number.isNaN(Number.parseFloat(saleRaw)) ||
          Number.parseFloat(saleRaw) < 0)
      ) {
        return `${label}: sale price is invalid.`;
      }

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

      const sku = String(variant.sku || "")
        .trim()
        .toUpperCase();
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

      const flatVariants = useHierarchicalVariants
        ? flattenVariantGroupsForApi(getVariantFormValues("variantGroups"))
        : variants;

      const variantsPayload = flatVariants.map((variant) => {
        const saleParsed = Number.parseFloat(variant.salePrice);
        const variant_sale_price =
          variant.salePrice !== "" &&
          variant.salePrice !== undefined &&
          variant.salePrice !== null &&
          Number.isFinite(saleParsed) &&
          saleParsed >= 0
            ? saleParsed
            : null;

        return {
          variant_attributes: Array.isArray(variant.variant_attributes)
            ? variant.variant_attributes
                .map((item) => ({
                  attributeId: Number(item.attributeId),
                  value: String(item.value || "").trim(),
                }))
                .filter(
                  (item) =>
                    Number.isInteger(item.attributeId) && item.attributeId > 0,
                )
            : [],
          price: Number.parseFloat(variant.price) || 0,
          stock: Number.parseInt(variant.stock, 10) || 0,
          sku: String(variant.sku || "").trim(),
          sale_price: variant_sale_price,
          variant_sale_price,
          images: Array.isArray(variant.images)
            ? variant.images
                .map((image) => String(image || "").trim())
                .filter(Boolean)
            : [],
        };
      });

      const nestedVariantGroups = useHierarchicalVariants
        ? getVariantFormValues("variantGroups")
        : null;

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
        ...(nestedVariantGroups ? { variantGroups: nestedVariantGroups } : {}),
        variationAttributeIds: selectedVariationAttributeIds.map((id) =>
          Number(id),
        ),
      };

      await api.post("/inventory", payload);
      toast.success("Product saved successfully.");
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      await refreshCategories();
      router.push("/inventory/all");
    } catch (error) {
      const message =
        error?.message ||
        error?.error ||
        "Unable to save this product right now.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-violet-100 px-4 py-8 md:px-6 md:py-10 lg:px-10">
      <FormProvider {...variantForm}>
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-[1400px] space-y-8"
        >
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
                exactCategoryMatch={exactCategoryMatch}
                onFieldChange={handleFieldChange}
                onCategoryInputChange={handleCategoryInputChange}
                onChooseSuggestion={handleChooseSuggestion}
              />
            </aside>

            <div className="space-y-8">
              <AttributeSpecs
                isLoadingSpecs={isLoadingSpecs}
                categoryId={formData.categoryId}
                isNewCategory={formData.isNewCategory}
                mappedAttributes={mappedAttributes}
                attributesForStep2={attributesForStep2}
                specValues={specValues}
                onSpecChange={handleSpecChange}
                primaryVariationAttributeId={primaryVariationAttributeId}
                primaryOptionSelections={primaryOptionSelections}
                onPrimaryOptionSelectionsChange={
                  handlePrimaryOptionSelectionsChange
                }
              />

              <VariantMatrixSection
                useHierarchicalVariants={useHierarchicalVariants}
                productName={formData.name}
                selectableAttributes={selectableVariationAttributes}
                selectedVariationAttributeIds={selectedVariationAttributeIds}
                primaryVariationAttributeId={primaryVariationAttributeId}
                onPrimaryVariationAttributeChange={
                  setPrimaryVariationAttributeId
                }
                onToggleVariationAttribute={toggleVariationAttribute}
                subAttributeDefinitions={subAttributeDefinitions}
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
      </FormProvider>
    </div>
  );
}
