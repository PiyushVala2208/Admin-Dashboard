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

/** @param {number[]} subAttributeIds */
export const createEmptySubVariant = (subAttributeIds = []) => ({
  clientKey: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  subAttributes: subAttributeIds.map((attributeId) => ({
    attributeId: Number(attributeId),
    value: "",
  })),
  price: "",
  salePrice: "",
  stock: "",
  sku: "",
});

/**
 * @param {number} primaryAttributeId
 * @param {string} primaryValue
 * @param {number[]} subAttributeIds
 */
export const createEmptyVariantGroup = (
  primaryAttributeId,
  primaryValue,
  subAttributeIds = [],
) => ({
  clientKey: `grp-${sanitizeSkuToken(primaryValue) || "GROUP"}-${Date.now()}`,
  primaryAttributeId: Number(primaryAttributeId),
  primaryValue: String(primaryValue || "").trim(),
  groupImage: "",
  subVariants: [createEmptySubVariant(subAttributeIds)],
});

export const subVariantAttributeKey = (subAttributes = []) => {
  const normalized = Array.isArray(subAttributes)
    ? [...subAttributes]
        .map((item) => ({
          attributeId: Number(item.attributeId),
          value: String(item.value || "")
            .trim()
            .toLowerCase(),
        }))
        .filter((item) => Number.isInteger(item.attributeId) && item.attributeId > 0)
        .sort((a, b) => a.attributeId - b.attributeId)
    : [];
  if (!normalized.length) return "base";
  return normalized.map((item) => `${item.attributeId}:${item.value}`).join("|");
};

/**
 * Ensure each sub-variant row has an entry per subAttributeId (stable order).
 * @param {Array<{ subAttributes?: Array<{ attributeId: number, value: string }> }>} rows
 * @param {number[]} subAttributeIds
 */
export const alignSubVariantAttributeSlots = (rows = [], subAttributeIds = []) => {
  const ids = subAttributeIds
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  return (Array.isArray(rows) ? rows : []).map((row) => {
    const map = new Map(
      (Array.isArray(row.subAttributes) ? row.subAttributes : []).map((item) => [
        Number(item.attributeId),
        String(item.value || ""),
      ]),
    );
    return {
      ...row,
      subAttributes: ids.map((attributeId) => ({
        attributeId,
        value: map.get(attributeId) ?? "",
      })),
    };
  });
};

/**
 * Flatten hierarchical groups to API-ready variant rows (product_variants + variant_attributes).
 * @param {Array<{
 *   primaryAttributeId: number,
 *   primaryValue: string,
 *   groupImage?: string,
 *   subVariants?: Array<{
 *     subAttributes?: Array<{ attributeId: number, value: string }>,
 *     price: string|number,
 *     salePrice?: string|number,
 *     stock: string|number,
 *     sku: string,
 *   }>
 * }>} groups
 */
export const flattenVariantGroupsForApi = (groups = []) => {
  const rows = [];
  for (const group of groups) {
    const primaryId = Number(group?.primaryAttributeId);
    const primaryVal = String(group?.primaryValue || "").trim();
    const groupImage = String(group?.groupImage || "").trim();
    const subs = Array.isArray(group?.subVariants) ? group.subVariants : [];

    for (const sub of subs) {
      const subAttrsRaw = Array.isArray(sub?.subAttributes) ? sub.subAttributes : [];
      const subAttrs = subAttrsRaw
        .map((item) => ({
          attributeId: Number(item.attributeId),
          value: String(item.value || "").trim(),
        }))
        .filter(
          (item) =>
            Number.isInteger(item.attributeId) &&
            item.attributeId > 0 &&
            item.value,
        );

      const variant_attributes = [];
      if (Number.isInteger(primaryId) && primaryId > 0 && primaryVal) {
        variant_attributes.push({ attributeId: primaryId, value: primaryVal });
      }
      variant_attributes.push(...subAttrs);

      rows.push({
        variant_attributes,
        price: sub?.price ?? "",
        salePrice: sub?.salePrice ?? "",
        stock: sub?.stock ?? "",
        sku: String(sub?.sku || "").trim(),
        images: groupImage ? [groupImage] : [],
      });
    }
  }
  return rows;
};

/**
 * Cartesian combinations for sub-attributes (e.g. all Size options, or Size×Material).
 * @param {Array<{ id: number|string, options?: string[] }>} subAttributeDefinitions
 */
export const buildSubAttributeCombinations = (subAttributeDefinitions = []) => {
  const attrs = (Array.isArray(subAttributeDefinitions) ? subAttributeDefinitions : [])
    .map((a) => ({
      id: Number(a.id),
      options: [...new Set((a.options || []).map((o) => String(o || "").trim()).filter(Boolean))],
    }))
    .filter((a) => Number.isInteger(a.id) && a.id > 0 && a.options.length > 0);

  if (!attrs.length) return [];

  return attrs.reduce((accumulator, attr) => {
    if (!accumulator.length) {
      return attr.options.map((value) => [{ attributeId: attr.id, value }]);
    }
    return accumulator.flatMap((combo) =>
      attr.options.map((value) => [...combo, { attributeId: attr.id, value }]),
    );
  }, []);
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
