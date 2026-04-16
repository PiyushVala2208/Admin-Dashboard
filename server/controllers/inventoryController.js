const inventoryModel = require("../models/inventoryModel");
const pool = require("../db");

// 1. Get all items
const handleGetItems = async (req, res) => {
  try {
    const result = await inventoryModel.getAllItems(req.user.id);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching items");
  }
};

// 2. Get single item
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

// 3. Create Item with Variants
const handleCreateItem = async (req, res) => {
  const {
    name,
    category,
    description,
    image,
    base_price,
    stock, 
    hasVariants,
    variants,
  } = req.body;
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const productResult = await inventoryModel.createItem(
      client,
      name,
      category,
      description,
      userId,
      image || null,
      base_price || 0,
      stock || 0, 
      hasVariants,
    );
    const productId = productResult.rows[0].id;

    if (hasVariants && variants && Array.isArray(variants)) {
      for (const variant of variants) {
        await inventoryModel.createVariant(client, productId, variant);
      }
    }

    await client.query("COMMIT");
    res
      .status(201)
      .json({
        message: "Product and variants added successfully!",
        id: productId,
      });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ DB Insert Error:", err.message);
    res
      .status(500)
      .json({ message: "Error adding product", error: err.message });
  } finally {
    client.release();
  }
};

// 4. Update Item
const handleUpdateItem = async (req, res) => {
  const { id } = req.params;
  const { name, category, description, image, base_price, variants } = req.body;
  const userId = req.user.id;

  try {
    await inventoryModel.updateItem(
      id,
      name,
      category,
      description,
      userId,
      image,
      base_price,
      variants,
    );

    const freshResult = await inventoryModel.getItemById(id, userId);

    if (freshResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Item updated but could not be retrieved" });
    }

    res.json(freshResult.rows[0]);
  } catch (err) {
    console.error("Update Controller Error:", err.message);
    res
      .status(500)
      .json({ message: "Error updating item", error: err.message });
  }
};

// 5. Delete Item
const handleDeleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await inventoryModel.deleteItem(id, req.user.id);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully!" });
  } catch (err) {
    res.status(500).send("Error deleting item");
  }
};

const handleDeleteVariant = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await inventoryModel.deleteVariant(id, userId);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Variant not found or not authorized" });
    }
    res.json({ message: "Variant deleted successfully!" });
  } catch (err) {
    console.error("Delete Variant Error:", err.message);
    res.status(500).json({
      message: "Error deleting variant",
      error: err.message,
    });
  }
};

module.exports = {
  handleGetItems,
  handleGetOneItem,
  handleCreateItem,
  handleUpdateItem,
  handleDeleteItem,
  handleDeleteVariant,
};
