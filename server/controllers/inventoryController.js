const inventoryModel = require("../models/inventoryModel");
const pool = require("../db");

const handleGetItems = async (req, res) => {
  try {
    const result = await inventoryModel.getAllItems(req.user.id);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching items");
  }
};

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

const handleCreateItem = async (req, res) => {
  const { name, category, description, image, hasVariants, variants } =
    req.body;
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
      hasVariants,
    );
    const productId = productResult.rows[0].id;

    if (variants && Array.isArray(variants)) {
      for (let i = 0; i < variants.length; i++) {
        const isDefault = i === 0;
        await inventoryModel.createVariant(
          client,
          productId,
          variants[i],
          isDefault,
        );
      }
    }

    await client.query("COMMIT");
    res
      .status(201)
      .json({ message: "Product added successfully!", id: productId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DB Insert Error:", err.message);
    res
      .status(500)
      .json({ message: "Error adding product", error: err.message });
  } finally {
    client.release();
  }
};

const handleUpdateItem = async (req, res) => {
  const { id } = req.params;
  const { name, category, description, image, hasVariants, variants } =
    req.body;
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await inventoryModel.updateItem(
      client,
      id,
      name,
      category,
      description,
      userId,
      image || null,
      hasVariants,
    );

    if (variants && Array.isArray(variants)) {
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];

        variant.is_default = i === 0;

        if (variant.id) {
          await inventoryModel.updateVariant(client, variant.id, variant);
        } else {
          await inventoryModel.createVariant(
            client,
            id,
            variant,
            variant.is_default,
          );
        }
      }
    }

    await client.query("COMMIT");
    const freshResult = await inventoryModel.getItemById(id, userId);
    res.json(freshResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update Controller Error:", err.message);
    res
      .status(500)
      .json({ message: "Error updating item", error: err.message });
  } finally {
    client.release();
  }
};

const handleDeleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await inventoryModel.deleteItem(id, req.user.id);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted successfully!" });
  } catch (err) {
    res.status(500).send("Error deleting item");
  }
};

const handleDeleteVariant = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await inventoryModel.deleteVariant(id, req.user.id);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Variant not found" });
    res.json({ message: "Variant deleted successfully!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting variant", error: err.message });
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
