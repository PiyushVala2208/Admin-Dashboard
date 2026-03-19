const inventoryModel = require("../models/inventoryModel");

// Get all items
const handleGetItems = async (req, res) => {
  try {
    const result = await inventoryModel.getAllItems(req.user.id);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error fetching items");
  }
};

// Get single item
const handleGetOneItem = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await inventoryModel.getItemById(id, req.user.id);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send("Error fetching item");
  }
};

// Create item
const handleCreateItem = async (req, res) => {
  const { name, category, stock, price, description } = req.body;

  try {
    await inventoryModel.createItem(
      name,
      category,
      stock,
      price,
      description,
      req.user.id,
    );
    res.status(201).json({ message: "Item added!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error adding item");
  }
};

// Update item
const handleUpdateItem = async (req, res) => {
  const { id } = req.params;
  const { name, category, stock, price, description } = req.body;

  try {
    const result = await inventoryModel.updateItem(
      id,
      name,
      category,
      stock,
      price,
      description,
      req.user.id,
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Update failed: Item not found or unauthorized" });
    }

    res.json({ message: "Item updated successfully!" });
  } catch (err) {
    res.status(500).send("Error updating item");
  }
};

// Delete item
const handleDeleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await inventoryModel.deleteItem(id, req.user.id);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Delete failed: Item not found or unauthorized" });
    }

    res.json({ message: "Item deleted successfully!" });
  } catch (err) {
    res.status(500).send("Error deleting item");
  }
};

module.exports = {
  handleGetItems,
  handleGetOneItem,
  handleCreateItem,
  handleUpdateItem,
  handleDeleteItem,
};
