const pool = require("../db");

const Product = {
  // Fetch products with filters & pagination
  getFilteredProducts: async ({
    category,
    minPrice,
    maxPrice,
    sortBy,
    limit,
    offset,
    search,
  }) => {
    let query = `SELECT * FROM inventory WHERE 1=1`;
    let values = [];
    let count = 1;

    // 1. Category Filter (Multi-select)
    if (category) {
      const categoryArray = category.split(",");
      query += ` AND category = ANY($${count})`;
      values.push(categoryArray);
      count++;
    }

    // 2. Price Filters
    if (minPrice) {
      query += ` AND price >= $${count}`;
      values.push(minPrice);
      count++;
    }
    if (maxPrice) {
      query += ` AND price <= $${count}`;
      values.push(maxPrice);
      count++;
    }

    // 3. Search Filter (WORKING)
    if (search) {
      query += ` AND (name ILIKE $${count} OR description ILIKE $${count})`;
      values.push(`%${search}%`);
      count++;
    }

    // Sorting logic
    if (sortBy === "price_low") query += ` ORDER BY price ASC`;
    else if (sortBy === "price_high") query += ` ORDER BY price DESC`;
    else query += ` ORDER BY id DESC`;

    // 4. Pagination (Limit & Offset)
    query += ` LIMIT $${count} OFFSET $${count + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Get total count
  getTotalCount: async ({ category, minPrice, maxPrice, search }) => {
    let query = `SELECT COUNT(*) FROM inventory WHERE 1=1`;
    let values = [];
    let count = 1;

    if (category) {
      const categoryArray = category.split(",");
      query += ` AND category = ANY($${count})`;
      values.push(categoryArray);
      count++;
    }
    if (minPrice) {
      query += ` AND price >= $${count}`;
      values.push(minPrice);
      count++;
    }
    if (maxPrice) {
      query += ` AND price <= $${count}`;
      values.push(maxPrice);
      count++;
    }
    // Added search here too
    if (search) {
      query += ` AND (name ILIKE $${count} OR description ILIKE $${count})`;
      values.push(`%${search}%`);
      count++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  },

  getAllUniqueCategories: async () => {
    const query = `SELECT DISTINCT category FROM inventory WHERE category IS NOT NULL ORDER BY category ASC`;
    const result = await pool.query(query);
    return result.rows.map((row) => row.category);
  },

  getProductById: async (id) => {
    try {
      const query = `SELECT * FROM inventory WHERE id = $1`;
      const result = await pool.query(query, [id]);
      return result.rows[0]; 
    } catch (error) {
      console.error("Database Error in getProductById:", error);
      throw error; 
    }
  },
};

module.exports = Product;