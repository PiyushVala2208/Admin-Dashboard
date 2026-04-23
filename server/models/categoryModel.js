const pool = require("../db");

const normalizeCategoryName = (value = "") => value.trim().replace(/\s+/g, " ");

const createSlug = (value = "") =>
  normalizeCategoryName(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const resolveExecutor = (client) => client || pool;

const Category = {
  create: async (data, client) => {
    const executor = resolveExecutor(client);
    const name = normalizeCategoryName(data.name);
    const slug = data.slug || createSlug(name);
    const attributes = Array.isArray(data.attributes) ? data.attributes : [];
    const description = data.description || null;

    const query = `
      INSERT INTO categories (name, slug, attributes, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [name, slug, JSON.stringify(attributes), description];
    const { rows } = await executor.query(query, values);
    return rows[0];
  },

  findAll: async () => {
    const query = `SELECT * FROM categories ORDER BY name ASC;`;
    const { rows } = await pool.query(query);
    return rows;
  },

  findBySlug: async (slug) => {
    const query = `SELECT * FROM categories WHERE slug = $1;`;
    const { rows } = await pool.query(query, [slug]);
    return rows[0];
  },

  findByName: async (name, client) => {
    const executor = resolveExecutor(client);
    const normalizedName = normalizeCategoryName(name);
    const query = `
      SELECT *
      FROM categories
      WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
      LIMIT 1;
    `;
    const { rows } = await executor.query(query, [normalizedName]);
    return rows[0] || null;
  },

  findOrCreateByName: async (name, client) => {
    const normalizedName = normalizeCategoryName(name);

    if (!normalizedName) {
      throw new Error("Category name is required");
    }

    const existingCategory = await Category.findByName(normalizedName, client);
    if (existingCategory) {
      return existingCategory;
    }

    try {
      return await Category.create(
        {
          name: normalizedName,
          slug: createSlug(normalizedName),
        },
        client,
      );
    } catch (error) {
      if (error.code === "23505") {
        return Category.findByName(normalizedName, client);
      }

      throw error;
    }
  },
};

module.exports = Category;
