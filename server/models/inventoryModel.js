const pool = require("../db");

// Get all items
const getAllItems = async (userId) => {
  return await pool.query("SELECT * FROM inventory WHERE user_id = $1", [userId]);
};

// Get single item
const getItemById = async (id, userId) => {
  return await pool.query("SELECT * FROM inventory WHERE id = $1 AND user_id = $2", [id, userId]);
};

// Create item
const createItem = async (name, category, stock, price, description, userId) => {
  return await pool.query(
    "INSERT INTO inventory (name, category, stock, price, description, user_id) VALUES ($1, $2, $3, $4, $5, $6)",
    [name, category, stock, price, description, userId]
  );
};

// Update item
const updateItem = async (id, name, category, stock, price, description, userId) => {
  return await pool.query(
    "UPDATE inventory SET name=$1, category=$2, stock=$3, price=$4, description=$5 WHERE id=$6 AND user_id=$7",
    [name, category, stock, price, description, id, userId]
  );
};

// Delete item
const deleteItem = async (id, userId) => {
  return await pool.query("DELETE FROM inventory WHERE id = $1 AND user_id = $2", [id, userId]);
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};