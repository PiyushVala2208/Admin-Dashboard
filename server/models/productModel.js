const pool = require("../db");

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

const ensureInventorySoftDeleteColumns = async (client) => {
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
};

const normalizeVariant = (variant = {}, index = 0) => {
  const normalizedImages = Array.isArray(variant.variant_images)
    ? variant.variant_images
    : [
        String(
          variant.variant_image ||
            variant.image ||
            (Array.isArray(variant.images) ? variant.images[0] : "") ||
            "",
        ).trim(),
      ];
  const images = [
    ...new Set(
      normalizedImages.map((item) => String(item || "").trim()).filter(Boolean),
    ),
  ];

  const rawSale = variant.variant_sale_price ?? variant.sale_price;
  const parsedSale = Number.parseFloat(rawSale);
  const variant_sale_price =
    rawSale === "" || rawSale === undefined || rawSale === null
      ? null
      : Number.isFinite(parsedSale) && parsedSale >= 0
        ? parsedSale
        : null;

  return {
    ...variant,
    is_default:
      typeof variant.is_default === "boolean"
        ? variant.is_default
        : index === 0,
    variant_attributes: Array.isArray(variant.variant_attributes)
      ? variant.variant_attributes
      : [],
    variant_images: images,
    images,
    variant_image: images[0] || null,
    price: Number(variant.variant_price ?? variant.price ?? 0),
    variant_sale_price,
    stock: Number(variant.variant_stock ?? variant.stock ?? 0),
  };
};

const Product = {
  getFilteredProducts: async ({
    category,
    minPrice,
    maxPrice,
    sortBy,
    limit,
    offset,
    search,
  }) => {
    await ensureInventorySoftDeleteColumns(pool);
    let query = `
      SELECT
        i.*,
        c.name AS category_name,
        c.slug AS category_slug,
        vd.id AS variant_id,
        vd.variant_image AS variant_image,
        vd.color AS variant_color,
        vd.size AS variant_size,
        vd.variant_price AS default_variant_price,
        vd.variant_stock AS default_variant_stock,
        COALESCE(vs.starting_from_price, 0) AS starting_from_price,
        COALESCE(vs.total_stock, 0) AS stock,
        COALESCE(vs.variant_count, 0) AS variant_count,
        COALESCE(vd.variant_image, i.image) AS image
      FROM inventory i
      LEFT JOIN LATERAL (
        SELECT
          MIN(pv.variant_price) AS starting_from_price,
          SUM(GREATEST(pv.variant_stock, 0))::int AS total_stock,
          COUNT(*)::int AS variant_count
        FROM product_variants pv
        WHERE pv.product_id = i.id
      ) vs ON true
      LEFT JOIN LATERAL (
        SELECT pv.*
        FROM product_variants pv
        WHERE pv.product_id = i.id
        ORDER BY pv.is_default DESC, pv.id ASC
        LIMIT 1
      ) vd ON true
      LEFT JOIN categories c ON i.category = c.slug OR i.category = c.name
      WHERE i.is_active = true
    `;

    const values = [];
    let count = 1;

    if (category) {
      const categoryArray = category.split(",");
      query += ` AND (c.slug = ANY($${count}) OR c.name = ANY($${count}))`;
      values.push(categoryArray);
      count++;
    }

    if (minPrice) {
      query += ` AND COALESCE(vs.starting_from_price, 0) >= $${count}`;
      values.push(Number(minPrice));
      count++;
    }

    if (maxPrice) {
      query += ` AND COALESCE(vs.starting_from_price, 0) <= $${count}`;
      values.push(Number(maxPrice));
      count++;
    }

    if (search) {
      query += ` AND (i.name ILIKE $${count} OR i.description ILIKE $${count})`;
      values.push(`%${search}%`);
      count++;
    }

    if (sortBy === "price_low")
      query += ` ORDER BY COALESCE(vs.starting_from_price, 0) ASC`;
    else if (sortBy === "price_high")
      query += ` ORDER BY COALESCE(vs.starting_from_price, 0) DESC`;
    else query += ` ORDER BY i.id DESC`;

    query += ` LIMIT $${count} OFFSET $${count + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows.map((row) => ({
      ...row,
      price: Number(row.starting_from_price || 0),
      starting_from_price: Number(row.starting_from_price || 0),
      stock: Number(row.stock || 0),
      has_variants:
        Number(row.variant_count || 0) > 1 || Boolean(row.has_variants),
    }));
  },

  getTotalCount: async ({ category, minPrice, maxPrice, search }) => {
    await ensureInventorySoftDeleteColumns(pool);
    let query = `
      SELECT COUNT(*)
      FROM inventory i
      LEFT JOIN LATERAL (
        SELECT MIN(pv.variant_price) AS starting_from_price
        FROM product_variants pv
        WHERE pv.product_id = i.id
      ) vs ON true
      LEFT JOIN categories c ON i.category = c.slug OR i.category = c.name
      WHERE i.is_active = true
    `;

    const values = [];
    let count = 1;

    if (category) {
      const categoryArray = category.split(",");
      query += ` AND (c.slug = ANY($${count}) OR c.name = ANY($${count}))`;
      values.push(categoryArray);
      count++;
    }
    if (minPrice) {
      query += ` AND COALESCE(vs.starting_from_price, 0) >= $${count}`;
      values.push(Number(minPrice));
      count++;
    }
    if (maxPrice) {
      query += ` AND COALESCE(vs.starting_from_price, 0) <= $${count}`;
      values.push(Number(maxPrice));
      count++;
    }
    if (search) {
      query += ` AND (i.name ILIKE $${count} OR i.description ILIKE $${count})`;
      values.push(`%${search}%`);
      count++;
    }

    const result = await pool.query(query, values);
    return Number.parseInt(result.rows[0].count, 10);
  },

  getAllUniqueCategories: async () => {
    const query = `SELECT name, slug, attributes FROM categories ORDER BY name ASC`;
    const result = await pool.query(query);
    return result.rows;
  },

  getProductById: async (id) => {
    try {
      await ensureInventorySoftDeleteColumns(pool);
      const hasAttributeValuesTable = await tableExists(
        pool,
        "product_attribute_values",
      );
      const hasAttributeRequiredColumn = await tableHasColumn(
        pool,
        "attributes",
        "is_required",
      );
      const hasCategoryAttributesTable = await tableExists(
        pool,
        "category_attributes",
      );

      const productQuery = `
        SELECT i.*, c.id AS category_id, c.name AS category_name, c.slug AS category_slug
        FROM inventory i
        LEFT JOIN categories c ON i.category = c.slug OR i.category = c.name
        WHERE i.id = $1 AND i.is_active = true
        LIMIT 1
      `;

      const variantsQuery = `SELECT * FROM product_variants WHERE product_id = $1 ORDER BY is_default DESC, id ASC`;

      const productRes = await pool.query(productQuery, [id]);
      if (productRes.rows.length === 0) return null;
      const baseProduct = productRes.rows[0];

      const [variantsRes, specsRes, definitionsRes] = await Promise.all([
        pool.query(variantsQuery, [id]),
        hasAttributeValuesTable
          ? pool.query(
              `
                SELECT
                  pav.attribute_id AS "attributeId",
                  pav.attribute_value AS value,
                  a.name AS attribute_name,
                  a.type AS attribute_type
                FROM product_attribute_values pav
                LEFT JOIN attributes a ON a.id = pav.attribute_id
                WHERE pav.product_id = $1
                ORDER BY pav.attribute_id ASC
              `,
              [id],
            )
          : Promise.resolve({ rows: [] }),
        baseProduct.category_id && hasCategoryAttributesTable
          ? pool.query(
              `
                SELECT
                  a.id,
                  a.name,
                  a.type,
                  ${
                    hasAttributeRequiredColumn
                      ? "(a.is_required OR ca.is_required)"
                      : "ca.is_required"
                  } AS is_required,
                  ca.sort_order,
                  COALESCE(
                    array_agg(ao.option_value ORDER BY ao.id) FILTER (WHERE ao.id IS NOT NULL),
                    '{}'
                  ) AS options
                FROM category_attributes ca
                INNER JOIN attributes a ON a.id = ca.attribute_id
                LEFT JOIN attribute_options ao ON ao.attribute_id = a.id
                WHERE ca.category_id = $1
                GROUP BY a.id, ca.is_required, ca.sort_order
                ORDER BY ca.sort_order ASC, a.name ASC
              `,
              [baseProduct.category_id],
            )
          : Promise.resolve({ rows: [] }),
      ]);

      const variants = variantsRes.rows.map((variant, index) =>
        normalizeVariant(variant, index),
      );

      const specifications = specsRes.rows.map((row) => ({
        attributeId: Number(row.attributeId),
        value: String(row.value || ""),
        attribute_name: row.attribute_name || null,
        attribute_type: row.attribute_type || null,
      }));

      return {
        ...baseProduct,
        variants,
        specifications,
        attribute_definitions: definitionsRes.rows,
      };
    } catch (error) {
      console.error("Database Error in getProductById:", error);
      throw error;
    }
  },
};

module.exports = Product;
