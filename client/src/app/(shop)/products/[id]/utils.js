export const normalizeVariant = (variant = {}, index = 0) => {
  const images = Array.isArray(variant.images)
    ? variant.images
    : Array.isArray(variant.variant_images)
      ? variant.variant_images
      : [variant.variant_image || variant.image];

  return {
    ...variant,
    is_default:
      typeof variant.is_default === "boolean"
        ? variant.is_default
        : index === 0,
    variant_attributes: Array.isArray(variant.variant_attributes)
      ? variant.variant_attributes
      : [],
    images: [
      ...new Set(
        images.map((item) => String(item || "").trim()).filter(Boolean),
      ),
    ],
    price: Number(variant.price ?? variant.variant_price ?? 0),
    stock: Number(variant.stock ?? variant.variant_stock ?? 0),
  };
};
