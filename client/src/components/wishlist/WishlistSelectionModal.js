"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

const isColorAttribute = (name = "") =>
  /color|colour/i.test(String(name || ""));
const isSizeAttribute = (name = "") => /size/i.test(String(name || ""));

const cleanString = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed.length > 0 ? trimmed : "";
};

const getSwatchStyle = (value = "") => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  const preset = {
    black: "#111827",
    white: "#f8fafc",
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    purple: "#8b3dff",
    pink: "#ec4899",
    gray: "#94a3b8",
    grey: "#94a3b8",
    silver: "#cbd5e1",
    gold: "#f59e0b",
    navy: "#1e3a8a",
    beige: "#f5f5dc",
    brown: "#92400e",
    orange: "#f97316",
  };

  if (preset[normalized]) return preset[normalized];
  return normalized || "#cbd5e1";
};

const normalizeVariantsForSelection = (
  variants = [],
  attributeDefinitionMap,
) => {
  const safeVariants = Array.isArray(variants) ? variants : [];

  return safeVariants.map((variant, index) => {
    const rawAttributes = Array.isArray(variant.variant_attributes)
      ? variant.variant_attributes
      : [];

    const normalizedAttributes = rawAttributes
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;

        const attributeId = Number(entry.attributeId ?? entry.attribute_id);

        const value = cleanString(entry.value || entry.attribute_value);
        if (!value) return null;

        const definitionName = attributeDefinitionMap.get(attributeId)?.name;

        const name = cleanString(
          entry.attributeName ||
            entry.attribute_name ||
            entry.name ||
            definitionName,
        );
        return {
          attributeId: Number.isInteger(attributeId) ? attributeId : null,
          name,
          value,
        };
      })
      .filter(Boolean);

    const hasColor = normalizedAttributes.some((attribute) =>
      isColorAttribute(attribute.name),
    );
    const hasSize = normalizedAttributes.some((attribute) =>
      isSizeAttribute(attribute.name),
    );

    const fallbackAttributes = [];
    if (!hasColor && cleanString(variant.color)) {
      fallbackAttributes.push({
        attributeId: -1,
        name: "Color",
        value: cleanString(variant.color),
      });
    }
    if (!hasSize && cleanString(variant.size)) {
      fallbackAttributes.push({
        attributeId: -2,
        name: "Size",
        value: cleanString(variant.size),
      });
    }

    const finalAttributes =
      normalizedAttributes.length > 0
        ? normalizedAttributes
        : fallbackAttributes;

    return {
      ...variant,
      is_default:
        typeof variant.is_default === "boolean"
          ? variant.is_default
          : index === 0,
      variant_attributes: finalAttributes,
      price: Number(variant.price ?? variant.variant_price ?? 0),
      stock: Number(variant.stock ?? variant.variant_stock ?? 0),
      variant_image:
        variant.variant_image ||
        (Array.isArray(variant.images) ? variant.images[0] : null) ||
        variant.image ||
        null,
      images: Array.isArray(variant.images)
        ? variant.images
        : Array.isArray(variant.variant_images)
          ? variant.variant_images
          : [],
    };
  });
};

const buildVariationAttributes = (variants = [], attributeDefinitionMap) => {
  const optionsById = new Map();

  variants.forEach((variant) => {
    (variant.variant_attributes || []).forEach((entry) => {
      const attributeId = Number(entry.attributeId ?? entry.attribute_id);
      if (!Number.isInteger(attributeId)) return;

      const value = cleanString(entry.value || entry.attribute_value);
      if (!value) return;

      if (!optionsById.has(attributeId)) {
        const definitionName = attributeDefinitionMap.get(attributeId)?.name;
        const name =
          cleanString(entry.name || definitionName) ||
          `Attribute ${attributeId}`;
        optionsById.set(attributeId, {
          attributeId,
          name,
          options: new Set(),
        });
      }
      optionsById.get(attributeId).options.add(value);
    });
  });

  return Array.from(optionsById.values())
    .map((entry) => ({
      attributeId: entry.attributeId,
      name: entry.name,
      options: Array.from(entry.options),
    }))
    .sort((a, b) => a.attributeId - b.attributeId);
};

const findMatchingVariant = (
  variants = [],
  selectedOptions,
  variationAttributes,
) => {
  if (!variants.length) return null;
  if (!variationAttributes.length) {
    return (
      variants.find((variant) => variant.is_default) || variants[0] || null
    );
  }

  const matches = variants.filter((variant) => {
    const attributeMap = new Map(
      (variant.variant_attributes || []).map((entry) => [
        Number(entry.attributeId ?? entry.attribute_id),
        cleanString(entry.value || entry.attribute_value),
      ]),
    );

    return variationAttributes.every((attribute) => {
      const selectedValue = selectedOptions[attribute.attributeId];
      if (!selectedValue) return false;
      return attributeMap.get(attribute.attributeId) === selectedValue;
    });
  });

  return matches.find((variant) => variant.is_default) || matches[0] || null;
};

const buildOptionAvailability = (
  variants = [],
  variationAttributes,
  selectedOptions,
) => {
  const availability = {};
  variationAttributes.forEach((attribute) => {
    const optionMap = {};
    attribute.options.forEach((option) => {
      optionMap[option] = false;
    });
    availability[attribute.attributeId] = optionMap;
  });

  variants.forEach((variant) => {
    if (Number(variant.stock ?? variant.variant_stock ?? 0) <= 0) return;

    const attributeMap = new Map(
      (variant.variant_attributes || []).map((entry) => [
        Number(entry.attributeId ?? entry.attribute_id),
        cleanString(entry.value || entry.attribute_value),
      ]),
    );

    variationAttributes.forEach((attribute) => {
      const optionValue = attributeMap.get(attribute.attributeId);
      if (!optionValue) return;

      const matchesSelection = variationAttributes.every((other) => {
        if (other.attributeId === attribute.attributeId) return true;
        const selectedValue = selectedOptions[other.attributeId];
        if (!selectedValue) return true;
        return attributeMap.get(other.attributeId) === selectedValue;
      });

      if (matchesSelection && availability[attribute.attributeId]) {
        availability[attribute.attributeId][optionValue] = true;
      }
    });
  });

  return availability;
};

const matchOptionValue = (options = [], value = "") => {
  const normalized = cleanString(value).toLowerCase();
  if (!normalized) return "";
  const matched = options.find(
    (option) => cleanString(option).toLowerCase() === normalized,
  );
  return matched || "";
};

export default function WishlistSelectionModal({
  isOpen,
  loading,
  item,
  product,
  onClose,
  onConfirm,
}) {
  const attributeDefinitionMap = useMemo(
    () =>
      new Map(
        (product?.attribute_definitions || []).map((definition) => [
          Number(definition.id),
          definition,
        ]),
      ),
    [product?.attribute_definitions],
  );

  const normalizedVariants = useMemo(
    () =>
      normalizeVariantsForSelection(
        product?.variants || [],
        attributeDefinitionMap,
      ),
    [product?.variants, attributeDefinitionMap],
  );

  const variationAttributes = useMemo(
    () => buildVariationAttributes(normalizedVariants, attributeDefinitionMap),
    [normalizedVariants, attributeDefinitionMap],
  );

  const initialSelectedOptions = useMemo(() => {
    const selectedOptions = {};
    const selectedAttributes = Array.isArray(item?.selectedAttributes)
      ? item.selectedAttributes
      : [];

    selectedAttributes.forEach((entry) => {
      const attributeId = Number(entry?.attributeId ?? entry?.attribute_id);
      if (!Number.isInteger(attributeId)) return;
      selectedOptions[attributeId] = cleanString(entry?.value);
    });

    variationAttributes.forEach((attribute) => {
      if (selectedOptions[attribute.attributeId]) {
        selectedOptions[attribute.attributeId] = matchOptionValue(
          attribute.options,
          selectedOptions[attribute.attributeId],
        );
        return;
      }

      if (
        isColorAttribute(attribute.name) &&
        cleanString(item?.selectedColor)
      ) {
        selectedOptions[attribute.attributeId] = matchOptionValue(
          attribute.options,
          item.selectedColor,
        );
        return;
      }

      if (isSizeAttribute(attribute.name) && cleanString(item?.selectedSize)) {
        selectedOptions[attribute.attributeId] = matchOptionValue(
          attribute.options,
          item.selectedSize,
        );
      }
    });

    return selectedOptions;
  }, [item, variationAttributes]);

  const [selectedOptions, setSelectedOptions] = useState(
    initialSelectedOptions,
  );

  useEffect(() => {
    setSelectedOptions(initialSelectedOptions);
  }, [initialSelectedOptions]);

  const missingAttributes = useMemo(
    () =>
      variationAttributes.filter(
        (attribute) => !initialSelectedOptions[attribute.attributeId],
      ),
    [variationAttributes, initialSelectedOptions],
  );

  const optionAvailability = useMemo(
    () =>
      buildOptionAvailability(
        normalizedVariants,
        variationAttributes,
        selectedOptions,
      ),
    [normalizedVariants, variationAttributes, selectedOptions],
  );

  const selectionComplete = useMemo(
    () =>
      variationAttributes.every(
        (attribute) => selectedOptions[attribute.attributeId],
      ),
    [variationAttributes, selectedOptions],
  );

  const matchedVariant = useMemo(
    () =>
      selectionComplete
        ? findMatchingVariant(
            normalizedVariants,
            selectedOptions,
            variationAttributes,
          )
        : null,
    [
      normalizedVariants,
      selectedOptions,
      variationAttributes,
      selectionComplete,
    ],
  );

  const matchedStock = Number(
    matchedVariant?.stock ?? matchedVariant?.variant_stock ?? 0,
  );
  const canConfirm = Boolean(
    selectionComplete && matchedVariant && matchedStock > 0,
  );

  const handleConfirm = () => {
    if (!canConfirm || !matchedVariant) return;

    const selectedAttributes = variationAttributes
      .map((attribute) => {
        const value = selectedOptions[attribute.attributeId];
        if (!value) return null;
        return {
          attributeId: attribute.attributeId,
          name: attribute.name,
          value: cleanString(value),
        };
      })
      .filter(Boolean);

    onConfirm({
      selectedOptions,
      selectedAttributes,
      matchedVariant,
      variationAttributes,
      normalizedVariants,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-[2rem] bg-white shadow-[0_25px_60px_rgba(0,0,0,0.25)]">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <X size={18} />
        </button>

        <div className="px-6 pb-7 pt-8 sm:px-8">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">
              Select remaining options
            </h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Choose options to move this item to cart.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
              <span className="text-xs font-bold text-slate-500">
                Loading options...
              </span>
            </div>
          ) : variationAttributes.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-5 text-amber-700">
              <AlertCircle size={18} />
              <span className="text-xs font-bold">
                No selectable options found for this item.
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {missingAttributes.length === 0 ? (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-5 text-slate-600">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-bold">
                    All required options are already selected.
                  </span>
                </div>
              ) : null}

              {missingAttributes.map((attribute) => (
                <div key={attribute.attributeId} className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {attribute.name}
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {attribute.options.map((option) => {
                      const optionValue = cleanString(option);
                      const isSelected =
                        selectedOptions[attribute.attributeId] === optionValue;
                      const isSwatch = isColorAttribute(attribute.name);
                      const isAvailable = optionAvailability?.[
                        attribute.attributeId
                      ]
                        ? optionAvailability[attribute.attributeId][
                            optionValue
                          ] !== false
                        : true;

                      return (
                        <button
                          key={`${attribute.attributeId}-${optionValue}`}
                          type="button"
                          onClick={() =>
                            isAvailable
                              ? setSelectedOptions((current) => ({
                                  ...current,
                                  [attribute.attributeId]: optionValue,
                                }))
                              : null
                          }
                          aria-disabled={!isAvailable}
                          className={`relative inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-all ${
                            isSelected
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-purple-200"
                          } ${
                            !isAvailable
                              ? "cursor-not-allowed opacity-50 grayscale"
                              : ""
                          }`}
                        >
                          {isSwatch ? (
                            <span
                              className="h-4 w-4 rounded-full border border-slate-300"
                              style={{
                                backgroundColor: getSwatchStyle(optionValue),
                              }}
                            />
                          ) : null}
                          {optionValue}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {selectionComplete && !matchedVariant ? (
                <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-5 text-rose-600">
                  <AlertCircle size={18} />
                  <span className="text-xs font-bold">
                    This combination is unavailable. Choose different options.
                  </span>
                </div>
              ) : null}

              {matchedVariant && matchedStock <= 0 ? (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-5 text-amber-700">
                  <AlertCircle size={18} />
                  <span className="text-xs font-bold">
                    Selected variant is out of stock.
                  </span>
                </div>
              ) : null}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="mt-8 w-full rounded-2xl bg-slate-900 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            {canConfirm ? "Move to cart" : "Select options"}
          </button>
        </div>
      </div>
    </div>
  );
}
