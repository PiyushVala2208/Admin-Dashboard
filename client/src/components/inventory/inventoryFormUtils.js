export const normalizeSpecValue = (value) => String(value ?? "").trim();

export const normalizeCategoryName = (value = "") =>
  String(value).trim().replace(/\s+/g, " ");

export const sanitizeSkuToken = (value = "") =>
  String(value)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const createVariantKey = (variantAttributes = []) => {
  const normalized = Array.isArray(variantAttributes)
    ? [...variantAttributes]
        .map((item) => ({
          attributeId: Number(item.attributeId),
          value: String(item.value || "")
            .trim()
            .toLowerCase(),
        }))
        .filter(
          (item) => Number.isInteger(item.attributeId) && item.attributeId > 0,
        )
        .sort((a, b) => a.attributeId - b.attributeId)
    : [];

  if (!normalized.length) {
    return "default";
  }

  return normalized
    .map((item) => `${item.attributeId}:${item.value}`)
    .join("|");
};

export const createEmptyVariant = (id = "default", variantAttributes = []) => ({
  id,
  variant_attributes: variantAttributes,
  price: "",
  stock: "",
  sku: "",
  images: [],
});

export const buildVariantCombinations = (selectedAttributes = []) => {
  if (!selectedAttributes.length) return [];

  const combinations = selectedAttributes.reduce(
    (accumulator, attribute) => {
      const options = [
        ...new Set(
          (attribute.options || [])
            .map((option) => String(option || "").trim())
            .filter(Boolean),
        ),
      ];

      return accumulator.flatMap((baseCombo) =>
        options.map((optionValue) => [
          ...baseCombo,
          {
            attributeId: Number(attribute.id),
            value: optionValue,
          },
        ]),
      );
    },
    [[]],
  );

  return combinations.map((variantAttributes) => ({
    id: createVariantKey(variantAttributes),
    variant_attributes: variantAttributes,
  }));
};

export const buildAutoSku = (
  productName,
  variantAttributes = [],
  index = 0,
) => {
  const productToken = sanitizeSkuToken(productName) || "PRODUCT";
  const attributeTokens = variantAttributes
    .map((item) => sanitizeSkuToken(item.value))
    .filter(Boolean);

  if (attributeTokens.length > 0) {
    return [productToken, ...attributeTokens].join("-");
  }

  return [productToken, index + 1].join("-");
};

export const syncVariantsForSelection = (variants = [], selectedIds = []) => {
  const normalizedIds = selectedIds
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
  const seededVariants =
    variants.length > 0 ? variants : [createEmptyVariant()];

  return seededVariants.map((variant, index) => {
    const existingMap = new Map(
      (Array.isArray(variant.variant_attributes)
        ? variant.variant_attributes
        : []
      ).map((item) => [Number(item.attributeId), String(item.value || "")]),
    );

    const nextAttributes = normalizedIds.map((attributeId) => ({
      attributeId,
      value: existingMap.get(attributeId) || "",
    }));

    return {
      ...variant,
      id: variant.id || `variant-${Date.now()}-${index}`,
      variant_attributes: nextAttributes,
    };
  });
};

export const renderSpecField = ({
  attribute,
  value,
  onChange,
  listIdPrefix = "spec-option",
}) => {
  const baseClassName =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#8b3dff] focus:ring-2 focus:ring-violet-100";

  if (attribute.type === "number") {
    return (
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Enter ${attribute.name}`}
        className={baseClassName}
      />
    );
  }

  if (attribute.type === "select") {
    const listId = `${listIdPrefix}-${attribute.id}`;

    return (
      <>
        <input
          list={listId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`Search ${attribute.name} options...`}
          className={baseClassName}
        />
        <datalist id={listId}>
          {(attribute.options || []).map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={`Enter ${attribute.name}`}
      className={baseClassName}
    />
  );
};
