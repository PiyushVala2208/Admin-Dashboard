const pool = require("../db");

const Category = {
  create: async (data) => {
    const { name, slug, attributes, description } = data;
    const query = `
      INSERT INTO categories (name, slug, attributes, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [name, slug, JSON.stringify(attributes || []), description];
    const { rows } = await pool.query(query, values);
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
};

module.exports = Category;
