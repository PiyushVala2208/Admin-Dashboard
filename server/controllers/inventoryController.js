const inventoryModel = require("../models/inventoryModel");
const Category = require("../models/categoryModel");
const pool = require("../db");

const normalizeCategoryName = (value = "") => value.trim().replace(/\s+/g, " ");

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
      is_default: false,
      color_order: group.color,
      size_order: sizeIndex,
    })),
  );
};

const sanitizeVariant = (variant = {}, index = 0) => {
  return {
    ...variant,
    label: variant.label?.trim() || null,
    size: variant.size?.trim() || null,
    color: variant.color?.trim() || null,
    sku: variant.sku?.trim() || null,
    variant_price: Number.parseFloat(variant.variant_price) || 0,
    variant_stock: Number.parseInt(variant.variant_stock, 10) || 0,
    variant_image: variant.variant_image?.trim() || null,
    is_default: index === 0,
  };
};

const handleGetItems = async (req, res) => {
  try {
    const { filter } = req.query;

    const result = await inventoryModel.getAllItems(req.user.id, filter);

    res.json(result.rows);
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

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).send("Error fetching item");
  }
};

const handleCreateItem = async (req, res) => {
  const {
    name,
    category,
    description,
    image,
    variants = [],
    variantGroups = [],
  } = req.body;
  const normalizedCategoryName = normalizeCategoryName(category);
  const normalizedName = name?.trim();
  const parsedVariantGroups = parseVariantGroups(variantGroups);
  const variantList = Array.isArray(variants) ? variants : [];
  const normalizedVariants =
    parsedVariantGroups.length > 0
      ? flattenVariantGroups(parsedVariantGroups).map((variant, index) =>
          sanitizeVariant(variant, index),
        )
      : variantList.length > 0
        ? variantList.map((variant, index) => sanitizeVariant(variant, index))
        : [sanitizeVariant({}, 0)];

  if (!normalizedName) {
    return res.status(400).json({ message: "Product name is required" });
  }

  if (!normalizedCategoryName) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const categoryRecord = await Category.findOrCreateByName(
      normalizedCategoryName,
      client,
    );

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
    description,
    image,
    variants = [],
    variantGroups = [],
  } = req.body;
  const normalizedCategoryName = normalizeCategoryName(category);
  const parsedVariantGroups = parseVariantGroups(variantGroups);
  const variantList = Array.isArray(variants) ? variants : [];
  const normalizedVariants =
    parsedVariantGroups.length > 0
      ? flattenVariantGroups(parsedVariantGroups).map((variant, index) =>
          sanitizeVariant(variant, index),
        )
      : variantList.map((variant, index) => sanitizeVariant(variant, index));
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const categoryRecord = normalizedCategoryName
      ? await Category.findOrCreateByName(normalizedCategoryName, client)
      : null;

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

    await client.query("COMMIT");
    const freshResult = await inventoryModel.getItemById(id, req.user.id);

    res.json(freshResult.rows[0]);
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
    res.status(500).send("Error deleting item");
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
