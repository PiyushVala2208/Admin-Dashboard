const pool = require("../db");

const getAllItems = async (userId) => {
  const query = `
    SELECT i.*, 
    COALESCE(
      json_agg(
        pv.* ORDER BY pv.is_default DESC, pv.id ASC
      ) FILTER (WHERE pv.id IS NOT NULL), '[]'
    ) as variants 
    FROM inventory i 
    LEFT JOIN product_variants pv ON i.id = pv.product_id 
    WHERE i.user_id = $1 
    GROUP BY i.id
    ORDER BY i.id DESC`;
  return await pool.query(query, [userId]);
};

const getItemById = async (id, userId) => {
  const query = `
    SELECT i.*, 
    COALESCE(
      json_agg(
        pv.* ORDER BY pv.is_default DESC
      ) FILTER (WHERE pv.id IS NOT NULL), '[]'
    ) as variants 
    FROM inventory i 
    LEFT JOIN product_variants pv ON i.id = pv.product_id 
    WHERE i.id = $1 AND i.user_id = $2 
    GROUP BY i.id`;
  return await pool.query(query, [id, userId]);
};

const createItem = async (
  client,
  name,
  category,
  description,
  userId,
  image,
  hasVariants,
) => {
  const query = `
    INSERT INTO inventory (name, category, description, user_id, image, has_variants) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING id`;

  return await client.query(query, [
    name,
    category,
    description,
    userId,
    image || null,
    hasVariants || false,
  ]);
};

const createVariant = async (client, productId, variant, isDefault = false) => {
  const { size, color, variant_price, variant_stock, sku, variant_image } =
    variant;

  const query = `
    INSERT INTO product_variants (
      product_id, size, color, variant_price, variant_stock, sku, variant_image, is_default
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`;

  return await client.query(query, [
    productId,
    size || null,
    color || null,
    parseFloat(variant_price) || 0,
    parseInt(variant_stock) || 0,
    sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    variant_image || null,
    isDefault,
  ]);
};

const updateItem = async (
  client,
  id,
  name,
  category,
  description,
  userId,
  image,
  hasVariants,
) => {
  const query = `
    UPDATE inventory 
    SET name=$1, category=$2, description=$3, image=$4, has_variants=$5
    WHERE id=$6 AND user_id=$7
    RETURNING *`;

  return await client.query(query, [
    name,
    category,
    description,
    image || null,
    hasVariants,
    id,
    userId,
  ]);
};

const updateVariant = async (client, variantId, variant) => {
  const {
    size,
    color,
    variant_price,
    variant_stock,
    sku,
    variant_image,
    is_default,
  } = variant;

  const query = `
      UPDATE product_variants 
      SET size=$1, color=$2, variant_price=$3, variant_stock=$4, sku=$5, variant_image=$6, is_default=$7
      WHERE id=$8
      RETURNING *`;

  return await client.query(query, [
    size || null,
    color || null,
    parseFloat(variant_price) || 0,
    parseInt(variant_stock) || 0,
    sku || null,
    variant_image || null,
    is_default || false,
    variantId,
  ]);
};

const deleteItem = async (id, userId) => {
  return await pool.query(
    "DELETE FROM inventory WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
};

const deleteVariant = async (variantId, userId) => {
  const checkQuery = `
    SELECT pv.id FROM product_variants pv
    JOIN inventory i ON pv.product_id = i.id
    WHERE pv.id = $1 AND i.user_id = $2
  `;

  const checkResult = await pool.query(checkQuery, [variantId, userId]);
  if (checkResult.rows.length === 0) {
    throw new Error("Variant not found or unauthorized");
  }

  return await pool.query("DELETE FROM product_variants WHERE id = $1", [
    variantId,
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
};
