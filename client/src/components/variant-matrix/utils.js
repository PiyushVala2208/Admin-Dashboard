export const sanitizeSkuToken = (value = "") =>
  String(value)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const createVariantLabel = (
  variantAttributes = [],
  attributeNameMap = new Map(),
) => {
  if (!variantAttributes.length) return "Base Variant";

  const normalized = variantAttributes
    .map((item) => {
      const name =
        attributeNameMap.get(Number(item.attributeId)) || "Attribute";
      const value = String(item.value || "").trim();
      return value ? `${name}: ${value}` : null;
    })
    .filter(Boolean);

  return normalized.length > 0 ? normalized.join(" | ") : "Untitled Variant";
};

export const buildSku = (
  productName,
  variantAttributes = [],
  fallbackIndex = 0,
) => {
  const productToken = sanitizeSkuToken(productName) || "PRODUCT";
  const variantTokens = variantAttributes
    .map((item) => sanitizeSkuToken(item.value))
    .filter(Boolean);

  if (variantTokens.length > 0) {
    return [productToken, ...variantTokens].join("-");
  }

  return [productToken, fallbackIndex + 1].join("-");
};
