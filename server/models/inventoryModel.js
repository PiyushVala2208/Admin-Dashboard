const pool = require("../db");

const tableHasColumn = async (client, tableName, columnName) => {
  const query = `
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = $1 AND column_name = $2
    LIMIT 1
  `;

  const result = await client.query(query, [tableName, columnName]);
  return result.rowCount > 0;
};

const mapVariantValues = (variant = {}) => {
  return {
    size: variant.size || variant.label || null,
    color: variant.color || null,
    variant_price: Number.parseFloat(variant.variant_price) || 0,
    variant_stock: Number.parseInt(variant.variant_stock, 10) || 0,
    sku: variant.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    variant_image: variant.variant_image || null,
    is_default: Boolean(variant.is_default),
  };
};

const getAllItems = async (userId, filterType = "all") => {
  let query = `
    SELECT i.*, 
    EXISTS (
      SELECT 1 FROM product_variants pv2 
      WHERE pv2.product_id = i.id AND pv2.variant_stock < 10
    ) as has_critical,

    (
      SELECT COUNT(*) FROM product_variants pv3 
      WHERE pv3.product_id = i.id AND pv3.variant_stock < 10
    ) as critical_variants_count,

    COALESCE(
      json_agg(
        pv.* ORDER BY pv.is_default DESC, pv.id ASC
      ) FILTER (WHERE pv.id IS NOT NULL), '[]'
    ) as variants
    FROM inventory i
    LEFT JOIN product_variants pv ON i.id = pv.product_id
    WHERE i.user_id = $1
    GROUP BY i.id
  `;

  if (filterType === "critical") {
    query += ` HAVING EXISTS (
      SELECT 1 FROM product_variants pv4 
      WHERE pv4.product_id = i.id AND pv4.variant_stock < 10
    )`;
  }

  query += ` ORDER BY i.id DESC`;

  return pool.query(query, [userId]);
};

const getItemById = async (id, userId) => {
  const query = `
    SELECT i.*, 
    EXISTS (
      SELECT 1 FROM product_variants pv2 
      WHERE pv2.product_id = i.id AND pv2.variant_stock < 10
    ) as has_critical,
    COALESCE(
      json_agg(
        pv.* ORDER BY pv.is_default DESC, pv.id ASC
      ) FILTER (WHERE pv.id IS NOT NULL), '[]'
    ) as variants
    FROM inventory i
    LEFT JOIN product_variants pv ON i.id = pv.product_id
    WHERE i.id = $1 AND i.user_id = $2
    GROUP BY i.id`;

  return pool.query(query, [id, userId]);
};

const createItem = async (client, productData) => {
  const supportsCategoryId = await tableHasColumn(
    client,
    "inventory",
    "category_id",
  );

  const columns = [
    "name",
    "category",
    "description",
    "user_id",
    "image",
    "has_variants",
  ];
  const values = [
    productData.name,
    productData.category,
    productData.description,
    productData.userId,
    productData.image || null,
    productData.hasVariants || false,
  ];

  if (supportsCategoryId) {
    columns.push("category_id");
    values.push(productData.categoryId || null);
  }

  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
  const query = `
    INSERT INTO inventory (${columns.join(", ")})
    VALUES (${placeholders})
    RETURNING id
  `;

  return client.query(query, values);
};

const createVariant = async (client, productId, variant, isDefault = false) => {
  const mappedVariant = mapVariantValues({
    ...variant,
    is_default: isDefault || variant.is_default,
  });

  const query = `
    INSERT INTO product_variants (
      product_id, size, color, variant_price, variant_stock, sku, variant_image, is_default
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  return client.query(query, [
    productId,
    mappedVariant.size,
    mappedVariant.color,
    mappedVariant.variant_price,
    mappedVariant.variant_stock,
    mappedVariant.sku,
    mappedVariant.variant_image,
    mappedVariant.is_default,
  ]);
};

const updateItem = async (client, id, productData) => {
  const supportsCategoryId = await tableHasColumn(
    client,
    "inventory",
    "category_id",
  );

  const assignments = [
    "name = $1",
    "category = $2",
    "description = $3",
    "image = $4",
    "has_variants = $5",
  ];
  const values = [
    productData.name,
    productData.category,
    productData.description,
    productData.image || null,
    productData.hasVariants || false,
  ];

  if (supportsCategoryId) {
    assignments.push(`category_id = $${values.length + 1}`);
    values.push(productData.categoryId || null);
  }

  values.push(id, productData.userId);

  const query = `
    UPDATE inventory
    SET ${assignments.join(", ")}
    WHERE id = $${values.length - 1} AND user_id = $${values.length}
    RETURNING *
  `;

  return client.query(query, values);
};

const updateVariant = async (client, variantId, variant) => {
  const mappedVariant = mapVariantValues(variant);

  const query = `
    UPDATE product_variants
    SET size = $1,
        color = $2,
        variant_price = $3,
        variant_stock = $4,
        sku = $5,
        variant_image = $6,
        is_default = $7
    WHERE id = $8
    RETURNING *
  `;

  return client.query(query, [
    mappedVariant.size,
    mappedVariant.color,
    mappedVariant.variant_price,
    mappedVariant.variant_stock,
    mappedVariant.sku,
    mappedVariant.variant_image,
    mappedVariant.is_default,
    variantId,
  ]);
};

const deleteItem = async (id, userId) => {
  return pool.query("DELETE FROM inventory WHERE id = $1 AND user_id = $2", [
    id,
    userId,
  ]);
};

const deleteVariant = async (variantId, userId) => {
  const checkQuery = `
    SELECT pv.id
    FROM product_variants pv
    JOIN inventory i ON pv.product_id = i.id
    WHERE pv.id = $1 AND i.user_id = $2
  `;

  const checkResult = await pool.query(checkQuery, [variantId, userId]);
  if (checkResult.rows.length === 0) {
    throw new Error("Variant not found or unauthorized");
  }

  return pool.query("DELETE FROM product_variants WHERE id = $1", [variantId]);
};

const deleteVariantsByProductId = async (client, productId) => {
  return client.query("DELETE FROM product_variants WHERE product_id = $1", [
    productId,
  ]);
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  createVariant,
  updateItem,
  updateVariant,
  deleteItem,
  deleteVariant,
  deleteVariantsByProductId,
};
