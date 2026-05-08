export const ATTRIBUTE_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
];

export const normalizeOptions = (options = []) =>
  Array.isArray(options)
    ? [
        ...new Set(
          options.map((value) => String(value || "").trim()).filter(Boolean),
        ),
      ]
    : [];

export const createSnapshot = ({ name, type, options, is_required }) =>
  JSON.stringify({
    name: String(name || "").trim(),
    type: String(type || "")
      .trim()
      .toLowerCase(),
    options: normalizeOptions(options),
    is_required: Boolean(is_required),
  });

export const buildDependencyInfo = (source = {}) => ({
  mapped_categories_count: Number(source.mapped_categories_count) || 0,
  product_usage_count: Number(source.product_usage_count) || 0,
  variant_usage_count: Number(source.variant_usage_count) || 0,
  is_in_use: Boolean(source.is_in_use),
  mapped_categories: Array.isArray(source.mapped_categories)
    ? source.mapped_categories
    : [],
  product_spec_usage: Array.isArray(source.product_spec_usage)
    ? source.product_spec_usage
    : [],
  product_variant_usage: Array.isArray(source.product_variant_usage)
    ? source.product_variant_usage
    : [],
});
