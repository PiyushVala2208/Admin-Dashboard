const pool = require("../db");

// 1. Get all items
const getAllItems = async (userId) => {
  const query = `
    SELECT i.*, 
    COALESCE(json_agg(pv.*) FILTER (WHERE pv.id IS NOT NULL), '[]') as variants 
    FROM inventory i 
    LEFT JOIN product_variants pv ON i.id = pv.product_id 
    WHERE i.user_id = $1 
    GROUP BY i.id`;
  return await pool.query(query, [userId]);
};

// 2. Get single item
const getItemById = async (id, userId) => {
  const query = `
    SELECT i.*, 
    COALESCE(json_agg(pv.*) FILTER (WHERE pv.id IS NOT NULL), '[]') as variants 
    FROM inventory i 
    LEFT JOIN product_variants pv ON i.id = pv.product_id 
    WHERE i.id = $1 AND i.user_id = $2 
    GROUP BY i.id`;
  return await pool.query(query, [id, userId]);
};

// 3. Create Main Product
const createItem = async (
  client,
  name,
  category,
  description,
  userId,
  image,
  base_price,
  stock,
  hasVariants,
) => {
  const query = `
    INSERT INTO inventory (name, category, description, user_id, image, base_price, stock, has_variants) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING id`;

  return await client.query(query, [
    name,
    category,
    description,
    userId,
    image || null,
    base_price || 0,
    stock || 0,
    hasVariants,
  ]);
};

// 4. Create Product Variant (Same, mapping price -> variant_price)
const createVariant = async (client, productId, variant) => {
  const { size, color, price, stock, sku, image } = variant;
  const query = `
    INSERT INTO product_variants (product_id, size, color, variant_price, variant_stock, sku, variant_image) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)`;

  return await client.query(query, [
    productId,
    size || null,
    color || null,
    price || 0,
    stock || 0,
    sku || null,
    image || null,
  ]);
};

// 5. Update Item & variants
const updateItem = async (
  id,
  name,
  category,
  description,
  userId,
  image,
  base_price,
  stock,
  variants,
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      "UPDATE inventory SET name=$1, category=$2, description=$3, image=$4, base_price=$5, stock=$6 WHERE id=$7 AND user_id=$8",
      [name, category, description, image, base_price, stock, id, userId],
    );

    await client.query("DELETE FROM product_variants WHERE product_id = $1", [
      id,
    ]);

    if (variants && variants.length > 0) {
      for (const variant of variants) {
        const variantQuery = `
          INSERT INTO product_variants (product_id, size, color, variant_price, variant_stock, sku, variant_image) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        await client.query(variantQuery, [
          id,
          variant.size,
          variant.color,
          variant.variant_price,
          variant.variant_stock,
          variant.sku,
          variant.variant_image,
        ]);
      }
    }

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
  deleteItem,
  deleteVariant,
};
