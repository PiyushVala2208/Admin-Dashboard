const inventoryModel = require("../models/inventoryModel");
const Category = require("../models/categoryModel");
const Attribute = require("../models/attributeModel");
const pool = require("../db");

const normalizeCategoryName = (value = "") => value.trim().replace(/\s+/g, " ");
const normalizeAttributeName = (value = "") =>
  String(value || "").trim().toLowerCase();

const parseVariantGroups = (variantGroups = []) => {
  if (!Array.isArray(variantGroups)) {
    return [];
  }

  return variantGroups
    .map((group) => ({
      color: group.color?.trim() || "",
      image: group.image?.trim() || null,
      sizes: Array.isArray(group.sizes)
        ? group.sizes
            .map((size) => ({
              size: size.size?.trim() || "",
              price: Number.parseFloat(size.price) || 0,
              stock: Number.parseInt(size.stock, 10) || 0,
              sku: size.sku?.trim() || null,
            }))
            .filter((size) => size.size)
        : [],
    }))
    .filter((group) => group.color && group.sizes.length > 0);
};

const flattenVariantGroups = (variantGroups) => {
  return variantGroups.flatMap((group) =>
    group.sizes.map((size, sizeIndex) => ({
      label: `${group.color} / ${size.size}`,
      size: size.size,
      color: group.color,
      sku: size.sku,
      variant_price: size.price,
      variant_stock: size.stock,
      variant_image: group.image,
      variant_images: group.image ? [group.image] : [],
      images: group.image ? [group.image] : [],
      is_default: false,
      color_order: group.color,
      size_order: sizeIndex,
    })),
  );
};

const sanitizeVariant = (variant = {}, index = 0) => {
  const normalizedAttributes = Array.isArray(variant.variant_attributes)
    ? variant.variant_attributes
        .map((item) => ({
          attributeId: Number.parseInt(item.attributeId, 10),
          value: String(item.value || "").trim(),
          attributeName: String(item.attributeName || "").trim(),
        }))
        .filter(
          (item) => Number.isInteger(item.attributeId) && item.attributeId > 0,
        )
    : [];

  const findAttributeValue = (nameMatcher) =>
    normalizedAttributes.find((item) => nameMatcher(item.attributeName || ""))?.value;

  const inferredColor =
    variant.color?.trim() ||
    findAttributeValue((name) => normalizeAttributeName(name) === "color") ||
    findAttributeValue((name) => normalizeAttributeName(name) === "colour") ||
    null;

  const inferredSize =
    variant.size?.trim() ||
    findAttributeValue((name) => normalizeAttributeName(name) === "size") ||
    findAttributeValue((name) => normalizeAttributeName(name) === "storage") ||
    null;

  const normalizedLabel =
    variant.label?.trim() ||
    normalizedAttributes
      .filter((item) => item.value)
      .map((item) => `${item.attributeName || "Attribute"}: ${item.value}`)
      .join(" | ") ||
    null;
  const normalizedImages = Array.isArray(variant.variant_images)
    ? variant.variant_images
    : Array.isArray(variant.images)
      ? variant.images
      : [
          variant.variant_image?.trim() || variant.image?.trim() || null,
        ];
  const cleanedImages = [
    ...new Set(
      normalizedImages.map((value) => String(value || "").trim()).filter(Boolean),
    ),
  ];

  const rawSale =
    variant.variant_sale_price ?? variant.sale_price ?? variant.salePrice;
  const parsedSale = Number.parseFloat(rawSale);
  const variant_sale_price =
    rawSale === "" || rawSale === undefined || rawSale === null
      ? null
      : Number.isFinite(parsedSale) && parsedSale >= 0
        ? parsedSale
        : null;

  return {
    ...variant,
    label: normalizedLabel,
    size: inferredSize,
    color: inferredColor,
    sku: variant.sku?.trim() || null,
    variant_price: Number.parseFloat(variant.variant_price ?? variant.price) || 0,
    variant_sale_price,
    variant_stock:
      Number.parseInt(variant.variant_stock ?? variant.stock, 10) || 0,
    variant_image: cleanedImages[0] || null,
    variant_images: cleanedImages,
    images: cleanedImages,
    is_default:
      typeof variant.is_default === "boolean" ? variant.is_default : index === 0,
    variant_attributes: normalizedAttributes,
  };
};

const normalizeSpecifications = (specifications = []) => {
  if (!Array.isArray(specifications)) return [];

  const deduped = new Map();
  specifications.forEach((item) => {
    if (!item || typeof item !== "object") return;

    const attributeId = Number.parseInt(item.attributeId, 10);
    const value = String(item.value ?? "").trim();

    if (!Number.isInteger(attributeId) || attributeId <= 0) return;
    deduped.set(attributeId, { attributeId, value });
  });

  return Array.from(deduped.values());
};

const hydrateInventoryItem = (item = {}) => {
  const variants = Array.isArray(item.variants)
    ? item.variants.map((variant) => sanitizeVariant(variant))
    : [];
  const specifications = normalizeSpecifications(
    Array.isArray(item.specifications)
      ? item.specifications
      : Array.isArray(item.attributes)
        ? item.attributes
        : [],
  );

  return {
    ...item,
    variants,
    specifications,
    attributes: specifications,
  };
};

const validateProductAttributes = (
  mappedAttributes = [],
  attributes = [],
  controlledAttributeIds = [],
) => {
  const mappingMap = new Map(
    mappedAttributes.map((item) => [Number(item.id), item]),
  );
  const controlledSet = new Set(
    (Array.isArray(controlledAttributeIds) ? controlledAttributeIds : [])
      .map((id) => Number.parseInt(id, 10))
      .filter((id) => Number.isInteger(id) && id > 0),
  );

  for (const mappedAttribute of mappedAttributes) {
    if (controlledSet.has(Number(mappedAttribute.id))) continue;
    if (!mappedAttribute.is_required) continue;

    const providedValue = attributes.find(
      (item) => Number(item.attributeId) === Number(mappedAttribute.id),
    )?.value;

    if (!String(providedValue || "").trim()) {
      return {
        error: `${mappedAttribute.name} is required for this category.`,
      };
    }
  }

  for (const attribute of attributes) {
    if (controlledSet.has(Number(attribute.attributeId))) {
      continue;
    }

    const mapping = mappingMap.get(Number(attribute.attributeId));
    if (!mapping) {
      return {
        error: "One or more specifications are not mapped to this category.",
      };
    }

    const value = String(attribute.value || "").trim();
    if (!value) continue;

    if (mapping.type === "number" && Number.isNaN(Number(value))) {
      return {
        error: `${mapping.name} must be a valid number.`,
      };
    }

    if (
      mapping.type === "select" &&
      Array.isArray(mapping.options) &&
      mapping.options.length > 0
    ) {
      const matchedOption = mapping.options.find(
        (option) => option.toLowerCase() === value.toLowerCase(),
      );

      if (!matchedOption) {
        return {
          error: `${mapping.name} must match one of the predefined options.`,
        };
      }

      attribute.value = matchedOption;
    }
  }

  return { error: null };
};

const validateVariantDefinitions = (
  variants = [],
  variationAttributeIds = [],
  mappedAttributes = [],
) => {
  const selectedVariationIds = (Array.isArray(variationAttributeIds)
    ? variationAttributeIds
    : []
  )
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => Number.isInteger(id) && id > 0);
  const mappedAttributeMap = new Map(
    mappedAttributes.map((attribute) => [Number(attribute.id), attribute]),
  );

  for (const attributeId of selectedVariationIds) {
    if (!mappedAttributeMap.has(attributeId)) {
      return {
        error: "One or more selected variation attributes are not mapped to the category.",
      };
    }
  }

  const duplicateIdentitySet = new Set();

  for (const [index, variant] of variants.entries()) {
    const label = `Variant ${index + 1}`;
    const variantAttributes = Array.isArray(variant.variant_attributes)
      ? variant.variant_attributes
      : [];

    if (!String(variant.sku || "").trim()) {
      return {
        error: `${label} is missing SKU.`,
      };
    }

    if (!Number.isFinite(Number(variant.variant_price)) || Number(variant.variant_price) < 0) {
      return {
        error: `${label} has an invalid price.`,
      };
    }

    const saleRaw =
      variant.variant_sale_price ?? variant.sale_price ?? variant.salePrice;
    if (
      saleRaw !== "" &&
      saleRaw !== undefined &&
      saleRaw !== null &&
      (!Number.isFinite(Number.parseFloat(saleRaw)) || Number.parseFloat(saleRaw) < 0)
    ) {
      return {
        error: `${label} has an invalid sale price.`,
      };
    }

    if (
      !Number.isInteger(Number.parseInt(variant.variant_stock, 10)) ||
      Number.parseInt(variant.variant_stock, 10) < 0
    ) {
      return {
        error: `${label} has an invalid stock value.`,
      };
    }

    for (const attributeId of selectedVariationIds) {
      const mappedAttribute = mappedAttributeMap.get(attributeId);
      const matchedAttribute = variantAttributes.find(
        (item) => Number(item.attributeId) === attributeId,
      );
      const value = String(matchedAttribute?.value || "").trim();

      if (!value) {
        return {
          error: `${label} is missing value for ${mappedAttribute.name}.`,
        };
      }
    }

    const combinationKey =
      selectedVariationIds.length > 0
        ? selectedVariationIds
            .map((attributeId) => {
              const value =
                variantAttributes.find(
                  (item) => Number(item.attributeId) === attributeId,
                )?.value || "";
              return `${attributeId}:${String(value).trim().toLowerCase()}`;
            })
            .join("|")
        : "default";
    const skuKey = String(variant.sku || "").trim().toUpperCase();
    const identity = `${combinationKey}||${skuKey}`;

    if (duplicateIdentitySet.has(identity)) {
      return {
        error:
          "Duplicate variants detected: same attribute combination with the same SKU is not allowed.",
      };
    }

    duplicateIdentitySet.add(identity);
  }

  return { error: null, selectedVariationIds };
};

const handleGetItems = async (req, res) => {
  try {
    const { filter } = req.query;

    const result = await inventoryModel.getAllItems(req.user.id, filter);

    res.json(result.rows.map((item) => hydrateInventoryItem(item)));
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    res.status(500).send("Error fetching items");
  }
};

const handleGetOneItem = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await inventoryModel.getItemById(id, req.user.id);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(hydrateInventoryItem(result.rows[0]));
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).send("Error fetching item");
  }
};

const handleCreateItem = async (req, res) => {
  const {
    name,
    category,
    categoryId,
    description,
    image,
    specifications = [],
    variants = [],
    variantGroups = [],
    attributes = [],
    variationAttributeIds = [],
  } = req.body;
  const normalizedCategoryName = normalizeCategoryName(category);
  const normalizedCategoryId = Number.parseInt(categoryId, 10);
  const normalizedName = name?.trim();
  const parsedVariantGroups = parseVariantGroups(variantGroups);
  const normalizedProductAttributes = normalizeSpecifications(
    Array.isArray(specifications) && specifications.length > 0
      ? specifications
      : attributes,
  );
  const variantList = Array.isArray(variants) ? variants : [];

  if (!normalizedName) {
    return res.status(400).json({ message: "Product name is required" });
  }

  if (
    !normalizedCategoryName &&
    !(Number.isInteger(normalizedCategoryId) && normalizedCategoryId > 0)
  ) {
    return res.status(400).json({ message: "Category is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let categoryRecord = null;
    if (Number.isInteger(normalizedCategoryId) && normalizedCategoryId > 0) {
      categoryRecord = await Category.findById(normalizedCategoryId, client);
      if (!categoryRecord) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Selected category not found" });
      }
    } else {
      categoryRecord = await Category.findOrCreateByName(
        normalizedCategoryName,
        client,
      );
    }

    const mappedAttributes = await Attribute.findByCategory(categoryRecord.id);
    const selectedVariationIdSet = new Set(
      (Array.isArray(variationAttributeIds) ? variationAttributeIds : [])
        .map((id) => Number.parseInt(id, 10))
        .filter((id) => Number.isInteger(id) && id > 0),
    );
    const mappedAttributeNameById = new Map(
      mappedAttributes.map((attribute) => [Number(attribute.id), attribute.name]),
    );
    const normalizedVariants =
      parsedVariantGroups.length > 0
        ? flattenVariantGroups(parsedVariantGroups).map((variant, index) =>
            sanitizeVariant(variant, index),
          )
        : variantList.length > 0
          ? variantList.map((variant, index) =>
              sanitizeVariant(
                {
                  ...variant,
                  variant_attributes: Array.isArray(variant.variant_attributes)
                    ? variant.variant_attributes.map((item) => ({
                        ...item,
                        attributeName: mappedAttributeNameById.get(
                          Number(item.attributeId),
                        ),
                      }))
                    : [],
                },
                index,
              ),
            )
          : [sanitizeVariant({}, 0)];
    const attributeValidation = validateProductAttributes(
      mappedAttributes,
      normalizedProductAttributes,
      Array.from(selectedVariationIdSet),
    );

    if (attributeValidation.error) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: attributeValidation.error });
    }

    const variantValidation = validateVariantDefinitions(
      normalizedVariants,
      Array.from(selectedVariationIdSet),
      mappedAttributes,
    );

    if (variantValidation.error) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: variantValidation.error });
    }

    const productResult = await inventoryModel.createItem(client, {
      name: normalizedName,
      category: categoryRecord.name,
      categoryId: categoryRecord.id,
      description: description?.trim() || null,
      userId: req.user.id,
      image:
        image?.trim() ||
        normalizedVariants.find((variant) => variant.variant_image)
          ?.variant_image ||
        null,
      hasVariants: normalizedVariants.length > 1,
    });

    const productId = productResult.rows[0].id;

    for (const [index, variant] of normalizedVariants.entries()) {
      await inventoryModel.createVariant(
        client,
        productId,
        variant,
        index === 0,
      );
    }

    await inventoryModel.replaceProductAttributes(
      client,
      productId,
      normalizedProductAttributes,
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Product added successfully",
      data: {
        id: productId,
        category: categoryRecord,
        hasVariants: normalizedVariants.length > 1,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating inventory item:", error);
    return res.status(500).json({
      message: "Error adding product",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

const handleUpdateItem = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    categoryId,
    description,
    image,
    specifications = [],
    variants = [],
    variantGroups = [],
    attributes = [],
    variationAttributeIds = [],
  } = req.body;
  const normalizedCategoryName = normalizeCategoryName(category);
  const parsedVariantGroups = parseVariantGroups(variantGroups);
  const variantList = Array.isArray(variants) ? variants : [];
  const normalizedProductAttributes = normalizeSpecifications(
    Array.isArray(specifications) && specifications.length > 0
      ? specifications
      : attributes,
  );
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const normalizedCategoryId = Number.parseInt(categoryId, 10);
    const categoryRecord = Number.isInteger(normalizedCategoryId) && normalizedCategoryId > 0
      ? await Category.findById(normalizedCategoryId, client)
      : normalizedCategoryName
        ? await Category.findOrCreateByName(normalizedCategoryName, client)
        : null;

    if (
      Number.isInteger(normalizedCategoryId) &&
      normalizedCategoryId > 0 &&
      !categoryRecord
    ) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Selected category not found" });
    }

    const mappedAttributes = categoryRecord
      ? await Attribute.findByCategory(categoryRecord.id)
      : [];
    const selectedVariationIdSet = new Set(
      (Array.isArray(variationAttributeIds) ? variationAttributeIds : [])
        .map((id) => Number.parseInt(id, 10))
        .filter((id) => Number.isInteger(id) && id > 0),
    );
    const mappedAttributeNameById = new Map(
      mappedAttributes.map((attribute) => [Number(attribute.id), attribute.name]),
    );
    const normalizedVariants =
      parsedVariantGroups.length > 0
        ? flattenVariantGroups(parsedVariantGroups).map((variant, index) =>
            sanitizeVariant(variant, index),
          )
        : variantList.length > 0
          ? variantList.map((variant, index) =>
              sanitizeVariant(
                {
                  ...variant,
                  variant_attributes: Array.isArray(variant.variant_attributes)
                    ? variant.variant_attributes.map((item) => ({
                        ...item,
                        attributeName: mappedAttributeNameById.get(
                          Number(item.attributeId),
                        ),
                      }))
                    : [],
                },
                index,
              ),
            )
        : [];

    if (normalizedVariants.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "At least one variant is required." });
    }
    const attributeValidation = validateProductAttributes(
      mappedAttributes,
      normalizedProductAttributes,
      Array.from(selectedVariationIdSet),
    );

    if (attributeValidation.error) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: attributeValidation.error });
    }

    const variantValidation = validateVariantDefinitions(
      normalizedVariants,
      Array.from(selectedVariationIdSet),
      mappedAttributes,
    );

    if (variantValidation.error) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: variantValidation.error });
    }

    await inventoryModel.updateItem(client, id, {
      name: name?.trim(),
      category: categoryRecord?.name || normalizedCategoryName || null,
      categoryId: categoryRecord?.id || null,
      description: description?.trim() || null,
      userId: req.user.id,
      image:
        image?.trim() ||
        normalizedVariants.find((variant) => variant.variant_image)
          ?.variant_image ||
        null,
      hasVariants: normalizedVariants.length > 1,
    });

    await inventoryModel.deleteVariantsByProductId(client, id);

    for (const [index, variant] of normalizedVariants.entries()) {
      await inventoryModel.createVariant(client, id, variant, index === 0);
    }

    await inventoryModel.replaceProductAttributes(
      client,
      id,
      normalizedProductAttributes,
    );

    await client.query("COMMIT");
    const freshResult = await inventoryModel.getItemById(id, req.user.id);

    res.json(hydrateInventoryItem(freshResult.rows[0]));
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update Controller Error:", error);
    res
      .status(500)
      .json({ message: "Error updating item", error: error.message });
  } finally {
    client.release();
  }
};

const handleDeleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await inventoryModel.deleteItem(id, req.user.id);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully!" });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    if (error?.code === "ITEM_IN_ORDERS") {
      return res.status(409).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error deleting item", error: error.message });
  }
};

const handleDeleteVariant = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await inventoryModel.deleteVariant(id, req.user.id);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Variant not found" });
    }

    res.json({ message: "Variant deleted successfully!" });
  } catch (error) {
    console.error("Error deleting inventory variant:", error);
    res
      .status(500)
      .json({ message: "Error deleting variant", error: error.message });
  }
};

module.exports = {
  handleGetItems,
  handleGetOneItem,
  handleCreateItem,
  handleUpdateItem,
  handleDeleteItem,
  handleDeleteVariant,
};
