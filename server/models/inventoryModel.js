const pool = require("../db");

let hasEnsuredVariantAttributesColumn = false;
let hasEnsuredVariantImagesColumn = false;
let hasEnsuredInventorySoftDeleteColumns = false;

const tableExists = async (client, tableName) => {
  const query = `
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = $1
    LIMIT 1
  `;
  const result = await client.query(query, [tableName]);
  return result.rowCount > 0;
};

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

const ensureVariantAttributesColumn = async (client) => {
  if (hasEnsuredVariantAttributesColumn) return;

  const hasVariantAttributes = await tableHasColumn(
    client,
    "product_variants",
    "variant_attributes",
  );

  if (!hasVariantAttributes) {
    await client.query(
      "ALTER TABLE product_variants ADD COLUMN variant_attributes jsonb NOT NULL DEFAULT '[]'::jsonb",
    );
  }

  hasEnsuredVariantAttributesColumn = true;
};

const ensureVariantImagesColumn = async (client) => {
  if (hasEnsuredVariantImagesColumn) return;

  const hasVariantImages = await tableHasColumn(
    client,
    "product_variants",
    "variant_images",
  );

  if (!hasVariantImages) {
    await client.query(
      "ALTER TABLE product_variants ADD COLUMN variant_images jsonb NOT NULL DEFAULT '[]'::jsonb",
    );
  }

  hasEnsuredVariantImagesColumn = true;
};

const ensureInventorySoftDeleteColumns = async (client) => {
  if (hasEnsuredInventorySoftDeleteColumns) return;

  const hasIsActive = await tableHasColumn(client, "inventory", "is_active");
  if (!hasIsActive) {
    await client.query(
      "ALTER TABLE inventory ADD COLUMN is_active boolean NOT NULL DEFAULT true",
    );
  }

  const hasDeletedAt = await tableHasColumn(client, "inventory", "deleted_at");
  if (!hasDeletedAt) {
    await client.query(
      "ALTER TABLE inventory ADD COLUMN deleted_at timestamptz NULL",
    );
  }

  hasEnsuredInventorySoftDeleteColumns = true;
};

const normalizeVariantAttributes = (variantAttributes = []) => {
  if (!Array.isArray(variantAttributes)) {
    return [];
  }

  const deduped = new Map();
  variantAttributes.forEach((item) => {
    if (!item || typeof item !== "object") return;

    const attributeId = Number.parseInt(item.attributeId, 10);
    const value = String(item.value || "").trim();

    if (!Number.isInteger(attributeId) || attributeId <= 0) return;
    deduped.set(attributeId, { attributeId, value });
  });

  return Array.from(deduped.values());
};

const mapVariantValues = (variant = {}) => {
  const normalizedImages = Array.isArray(variant.variant_images)
    ? variant.variant_images
    : Array.isArray(variant.images)
      ? variant.images
      : [
          variant.variant_image ||
            variant.image ||
            (Array.isArray(variant.images) ? variant.images[0] : null),
        ];
  const cleanedImages = [
    ...new Set(
      normalizedImages.map((item) => String(item || "").trim()).filter(Boolean),
    ),
  ];

  return {
    size: variant.size || variant.label || null,
    color: variant.color || null,
    variant_price:
      Number.parseFloat(variant.variant_price ?? variant.price) || 0,
    variant_stock:
      Number.parseInt(variant.variant_stock ?? variant.stock, 10) || 0,
    sku: variant.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    variant_image: cleanedImages[0] || null,
    variant_images: cleanedImages,
    is_default: Boolean(variant.is_default),
    variant_attributes: normalizeVariantAttributes(variant.variant_attributes),
  };
};

const getAllItems = async (userId, filterType = "all") => {
  await ensureInventorySoftDeleteColumns(pool);
  const hasAttributeValuesTable = await tableExists(
    pool,
    "product_attribute_values",
  );

  let query = `
    SELECT
      i.*,
      EXISTS (
        SELECT 1
        FROM product_variants pv2
        WHERE pv2.product_id = i.id AND pv2.variant_stock < 10
      ) AS has_critical,
      (
        SELECT COUNT(*)
        FROM product_variants pv3
        WHERE pv3.product_id = i.id AND pv3.variant_stock < 10
      ) AS critical_variants_count,
      COALESCE(
        (
          SELECT json_agg(pv.* ORDER BY pv.is_default DESC, pv.id ASC)
          FROM product_variants pv
          WHERE pv.product_id = i.id
        ),
        '[]'::json
      ) AS variants,
      ${
        hasAttributeValuesTable
          ? `COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'attributeId', pav.attribute_id,
                    'value', pav.attribute_value
                  )
                  ORDER BY pav.attribute_id ASC
                )
                FROM product_attribute_values pav
                WHERE pav.product_id = i.id
              ),
              '[]'::json
            )`
          : "'[]'::json"
      } AS specifications
    FROM inventory i
    WHERE i.user_id = $1 AND i.is_active = true
  `;

  if (filterType === "critical") {
    query += ` AND EXISTS (
      SELECT 1 FROM product_variants pv4 
      WHERE pv4.product_id = i.id AND pv4.variant_stock < 10
    )`;
  }

  query += ` ORDER BY i.id DESC`;

  return pool.query(query, [userId]);
};

const getItemById = async (id, userId) => {
  await ensureInventorySoftDeleteColumns(pool);
  const hasAttributeValuesTable = await tableExists(
    pool,
    "product_attribute_values",
  );

  const query = `
    SELECT i.*,
    EXISTS (
      SELECT 1 FROM product_variants pv2 
      WHERE pv2.product_id = i.id AND pv2.variant_stock < 10
    ) as has_critical,
    COALESCE(
      (
        SELECT json_agg(pv.* ORDER BY pv.is_default DESC, pv.id ASC)
        FROM product_variants pv
        WHERE pv.product_id = i.id
      ),
      '[]'::json
    ) as variants,
    ${
      hasAttributeValuesTable
        ? `COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'attributeId', pav.attribute_id,
                  'value', pav.attribute_value
                )
                ORDER BY pav.attribute_id ASC
              )
              FROM product_attribute_values pav
              WHERE pav.product_id = i.id
            ),
            '[]'::json
          )`
        : "'[]'::json"
    } as specifications
    FROM inventory i
    WHERE i.id = $1 AND i.user_id = $2 AND i.is_active = true
    LIMIT 1`;

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
  await ensureVariantAttributesColumn(client);
  await ensureVariantImagesColumn(client);

  const mappedVariant = mapVariantValues({
    ...variant,
    is_default: isDefault || variant.is_default,
  });

  const query = `
    INSERT INTO product_variants (
      product_id, size, color, variant_price, variant_stock, sku, variant_image, variant_images, is_default, variant_attributes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10::jsonb)
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
    JSON.stringify(mappedVariant.variant_images),
    mappedVariant.is_default,
    JSON.stringify(mappedVariant.variant_attributes),
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
  await ensureVariantAttributesColumn(client);
  await ensureVariantImagesColumn(client);

  const mappedVariant = mapVariantValues(variant);

  const query = `
    UPDATE product_variants
    SET size = $1,
        color = $2,
        variant_price = $3,
        variant_stock = $4,
        sku = $5,
        variant_image = $6,
        variant_images = $7::jsonb,
        is_default = $8,
        variant_attributes = $9::jsonb
    WHERE id = $10
    RETURNING *
  `;

  return client.query(query, [
    mappedVariant.size,
    mappedVariant.color,
    mappedVariant.variant_price,
    mappedVariant.variant_stock,
    mappedVariant.sku,
    mappedVariant.variant_image,
    JSON.stringify(mappedVariant.variant_images),
    mappedVariant.is_default,
    JSON.stringify(mappedVariant.variant_attributes),
    variantId,
  ]);
};

const deleteItem = async (id, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await ensureInventorySoftDeleteColumns(client);

    const itemResult = await client.query(
      "SELECT id FROM inventory WHERE id = $1 AND user_id = $2 FOR UPDATE",
      [id, userId],
    );

    if (itemResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { rowCount: 0 };
    }

    const hasOrderItemsTable = await tableExists(client, "order_items");
    if (hasOrderItemsTable) {
      const orderCheck = await client.query(
        "SELECT 1 FROM order_items WHERE product_id = $1 LIMIT 1",
        [id],
      );

      if (orderCheck.rowCount > 0) {
        const softDeleteResult = await client.query(
          "UPDATE inventory SET is_active = false, deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND is_active = true",
          [id, userId],
        );
        await client.query("COMMIT");
        return softDeleteResult;
      }
    }

    const hasVariantsTable = await tableExists(client, "product_variants");
    if (hasVariantsTable) {
      await client.query("DELETE FROM product_variants WHERE product_id = $1", [
        id,
      ]);
    }

    const hasAttributeValuesTable = await tableExists(
      client,
      "product_attribute_values",
    );
    if (hasAttributeValuesTable) {
      await client.query(
        "DELETE FROM product_attribute_values WHERE product_id = $1",
        [id],
      );
    }

    const result = await client.query(
      "DELETE FROM inventory WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

const replaceProductAttributes = async (client, productId, attributes = []) => {
  const hasAttributeValuesTable = await tableExists(
    client,
    "product_attribute_values",
  );
  if (!hasAttributeValuesTable) {
    return;
  }

  await client.query(
    "DELETE FROM product_attribute_values WHERE product_id = $1",
    [productId],
  );

  if (!Array.isArray(attributes) || attributes.length === 0) {
    return;
  }

  const normalizedAttributes = attributes
    .map((item) => ({
      attributeId: Number.parseInt(item.attributeId, 10),
      value: String(item.value ?? "").trim(),
    }))
    .filter(
      (item) =>
        Number.isInteger(item.attributeId) &&
        item.attributeId > 0 &&
        item.value,
    );

  if (normalizedAttributes.length === 0) {
    return;
  }

  const attributeIds = normalizedAttributes.map((item) => item.attributeId);
  const values = normalizedAttributes.map((item) => item.value);

  const insertQuery = `
    INSERT INTO product_attribute_values (product_id, attribute_id, attribute_value)
    SELECT $1, pair.attribute_id, pair.attribute_value
    FROM (
      SELECT
        id_values.attribute_id,
        value_values.attribute_value
      FROM unnest($2::int[]) WITH ORDINALITY id_values(attribute_id, ord)
      INNER JOIN unnest($3::text[]) WITH ORDINALITY value_values(attribute_value, ord)
        ON id_values.ord = value_values.ord
    ) AS pair
    INNER JOIN attributes a ON a.id = pair.attribute_id
  `;

  await client.query(insertQuery, [productId, attributeIds, values]);
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
  replaceProductAttributes,
};
