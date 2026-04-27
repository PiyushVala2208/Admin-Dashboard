const pool = require("../db");

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
    let query = `
      SELECT 
        i.*, 
        pv.id as variant_id,
        pv.variant_image as variant_image,
        pv.color as variant_color,
        pv.size as variant_size,
        pv.variant_price as price, 
        pv.variant_stock as stock,
        c.name as category_name,
        c.slug as category_slug
      FROM inventory i
      LEFT JOIN product_variants pv ON i.id = pv.product_id AND pv.is_default = true
      LEFT JOIN categories c ON i.category = c.slug OR i.category = c.name
      WHERE 1=1`;

    let values = [];
    let count = 1;

    // 1. Category Filter 
    if (category) {
      const categoryArray = category.split(",");
      query += ` AND (c.slug = ANY($${count}) OR c.name = ANY($${count}))`;
      values.push(categoryArray);
      count++;
    }

    // 2. Price Filters
    if (minPrice) {
      query += ` AND pv.variant_price >= $${count}`;
      values.push(minPrice);
      count++;
    }
    if (maxPrice) {
      query += ` AND pv.variant_price <= $${count}`;
      values.push(maxPrice);
      count++;
    }

    // 3. Search logic
    if (search) {
      query += ` AND (i.name ILIKE $${count} OR i.description ILIKE $${count})`;
      values.push(`%${search}%`);
      count++;
    }

    // 4. Sorting
    if (sortBy === "price_low") query += ` ORDER BY pv.variant_price ASC`;
    else if (sortBy === "price_high")
      query += ` ORDER BY pv.variant_price DESC`;
    else query += ` ORDER BY i.id DESC`;

    // 5. Pagination
    query += ` LIMIT $${count} OFFSET $${count + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  getTotalCount: async ({ category, minPrice, maxPrice, search }) => {
    let query = `
      SELECT COUNT(*) 
      FROM inventory i
      LEFT JOIN product_variants pv ON i.id = pv.product_id AND pv.is_default = true
      LEFT JOIN categories c ON i.category = c.slug OR i.category = c.name
      WHERE 1=1`;

    let values = [];
    let count = 1;

    if (category) {
      const categoryArray = category.split(",");
      query += ` AND (c.slug = ANY($${count}) OR c.name = ANY($${count}))`;
      values.push(categoryArray);
      count++;
    }
    if (minPrice) {
      query += ` AND pv.variant_price >= $${count}`;
      values.push(minPrice);
      count++;
    }
    if (maxPrice) {
      query += ` AND pv.variant_price <= $${count}`;
      values.push(maxPrice);
      count++;
    }
    if (search) {
      query += ` AND (i.name ILIKE $${count} OR i.description ILIKE $${count})`;
      values.push(`%${search}%`);
      count++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  },

  // Category Fetch updated to use the categories table
  getAllUniqueCategories: async () => {
    const query = `SELECT name, slug, attributes FROM categories ORDER BY name ASC`;
    const result = await pool.query(query);
    return result.rows; 
  },

  getProductById: async (id) => {
    try {
      const productQuery = `
        SELECT i.*, c.name as category_name, c.attributes as category_attributes
        FROM inventory i
        LEFT JOIN categories c ON i.category = c.slug OR i.category = c.name
        WHERE i.id = $1`;

      const variantsQuery = `SELECT * FROM product_variants WHERE product_id = $1 ORDER BY is_default DESC`;

      const productRes = await pool.query(productQuery, [id]);
      const variantsRes = await pool.query(variantsQuery, [id]);

      if (productRes.rows.length === 0) return null;

      return {
        ...productRes.rows[0],
        variants: variantsRes.rows,
      };
    } catch (error) {
      console.error("Database Error in getProductById:", error);
      throw error;
    }
  },
};

module.exports = Product;
