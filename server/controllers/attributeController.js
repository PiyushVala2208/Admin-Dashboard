const Attribute = require("../models/attributeModel");
const Category = require("../models/categoryModel");
const pool = require("../db");

const ATTRIBUTE_TYPES = new Set(["text", "number", "select"]);

const normalizeType = (value = "") => String(value).trim().toLowerCase();
const normalizeName = (value = "") => String(value || "").trim();

const normalizeOptions = (options = []) =>
  Array.isArray(options)
    ? [...new Set(options.map((option) => String(option || "").trim()).filter(Boolean))]
    : [];

const normalizeAttributeMappings = (payload) => {
  if (!Array.isArray(payload)) return [];

  return payload
    .map((item, index) => {
      const isObjectItem =
        item !== null && typeof item === "object" && !Array.isArray(item);

      const attributeId = Number.parseInt(
        isObjectItem ? item.attributeId : item,
        10,
      );
      const isRequired = Boolean(
        isObjectItem ? item.is_required || item.isRequired : false,
      );
      const sortOrder = Number.parseInt(
        isObjectItem ? item.sort_order ?? item.sortOrder : index,
        10,
      );

      if (!Number.isInteger(attributeId) || attributeId <= 0) {
        return null;
      }

      return {
        attributeId,
        is_required: isRequired,
        sort_order: Number.isInteger(sortOrder) ? sortOrder : index,
      };
    })
    .filter(Boolean);
};

const createAttribute = async (req, res) => {
  try {
    const { name, type, options, categoryId, isRequired } = req.body;
    const normalizedName = normalizeName(name);
    const normalizedType = normalizeType(type);
    const normalizedOptions = normalizeOptions(options);
    const hasCategoryId =
      categoryId !== undefined &&
      categoryId !== null &&
      String(categoryId).trim() !== "";
    const normalizedCategoryId = Number.parseInt(categoryId, 10);

    if (!normalizedName || !normalizedType) {
      return res.status(400).json({
        success: false,
        message: "Name and type are required",
      });
    }

    if (!ATTRIBUTE_TYPES.has(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attribute type. Use text, number, or select.",
      });
    }

    if (normalizedType === "select" && normalizedOptions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select type attributes require at least one option.",
      });
    }

    if (hasCategoryId) {
      if (!Number.isInteger(normalizedCategoryId) || normalizedCategoryId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid category ID is required for mapping.",
        });
      }

      const category = await Category.findById(normalizedCategoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found for mapping",
        });
      }
    }

    const newAttr = await Attribute.create(
      normalizedName,
      normalizedType,
      Boolean(isRequired),
    );

    if (normalizedType === "select") {
      await Attribute.addOptions(newAttr.id, normalizedOptions);
    }

    if (hasCategoryId) {
      await Attribute.mapToCategory(
        normalizedCategoryId,
        newAttr.id,
        Boolean(isRequired),
      );
    }

    res.status(201).json({
      success: true,
      message:
        hasCategoryId
          ? "Attribute created and mapped successfully!"
          : "Attribute created successfully!",
      data: newAttr,
    });
  } catch (error) {
    console.error("Error in createAttribute:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "An attribute with this name already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateAttribute = async (req, res) => {
  const { id: rawId } = req.params;
  const attributeId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(attributeId) || attributeId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid attribute ID is required",
    });
  }

  try {
    const existingAttribute = await Attribute.findById(attributeId);
    if (!existingAttribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found",
      });
    }

    const normalizedName = normalizeName(
      req.body?.name ?? existingAttribute.name,
    );
    const requestedType =
      req.body?.type !== undefined
        ? normalizeType(req.body.type)
        : existingAttribute.type;
    const normalizedOptions = normalizeOptions(
      req.body?.options ?? existingAttribute.options ?? [],
    );
    const normalizedIsRequired =
      req.body?.is_required !== undefined || req.body?.isRequired !== undefined
        ? Boolean(req.body?.is_required ?? req.body?.isRequired)
        : Boolean(existingAttribute.is_required);

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: "Attribute name is required",
      });
    }

    if (!ATTRIBUTE_TYPES.has(requestedType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attribute type. Use text, number, or select.",
      });
    }

    if (requestedType === "select" && normalizedOptions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select type attributes require at least one option.",
      });
    }

    const existingType = normalizeType(existingAttribute.type);
    const isTypeChanging = existingType !== requestedType;
    if (isTypeChanging && existingAttribute.is_in_use) {
      return res.status(409).json({
        success: false,
        message:
          "This attribute is in use, so its type cannot be changed.",
      });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const updated = await Attribute.updateById(
        attributeId,
        {
          name: normalizedName,
          type: requestedType,
          is_required: normalizedIsRequired,
        },
        client,
      );

      if (!updated) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          success: false,
          message: "Attribute not found",
        });
      }

      await Attribute.replaceOptions(
        attributeId,
        requestedType === "select" ? normalizedOptions : [],
        client,
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const freshAttribute = await Attribute.findById(attributeId);
    return res.status(200).json({
      success: true,
      message: "Attribute updated successfully",
      data: freshAttribute,
    });
  } catch (error) {
    console.error("Error in updateAttribute:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "An attribute with this name already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAttributeDependencies = async (req, res) => {
  const { id: rawId } = req.params;
  const attributeId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(attributeId) || attributeId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid attribute ID is required",
    });
  }

  try {
    const attribute = await Attribute.findById(attributeId);
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found",
      });
    }

    const dependencies = await Attribute.getDependencyImpactReport(attributeId);
    return res.status(200).json({
      success: true,
      data: {
        attribute_id: attributeId,
        ...dependencies,
      },
    });
  } catch (error) {
    console.error("Error in getAttributeDependencies:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attribute dependencies",
      error: error.message,
    });
  }
};

const deleteAttribute = async (req, res) => {
  const { id: rawId } = req.params;
  const attributeId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(attributeId) || attributeId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid attribute ID is required",
    });
  }

  const client = await pool.connect();
  let hasActiveTransaction = false;

  try {
    const existingAttribute = await Attribute.findById(attributeId, client);
    if (!existingAttribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found",
      });
    }

    const dependencies = await Attribute.getDependencyImpactReport(
      attributeId,
      client,
    );

    if (
      Number(dependencies.product_usage_count) > 0 ||
      Number(dependencies.variant_usage_count) > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete this attribute because it is used by active products.",
        code: "ATTRIBUTE_IN_USE",
        impact: dependencies,
      });
    }

    await client.query("BEGIN");
    hasActiveTransaction = true;
    await Attribute.removeMappings(attributeId, client);
    const deleted = await Attribute.softDeleteById(attributeId, client);

    if (!deleted) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Attribute not found",
      });
    }

    await client.query("COMMIT");
    hasActiveTransaction = false;

    return res.status(200).json({
      success: true,
      message: "Attribute deleted successfully",
      data: {
        id: attributeId,
        removed_mappings_count: dependencies.mapped_categories_count || 0,
        impact: dependencies,
      },
    });
  } catch (error) {
    if (hasActiveTransaction) {
      await client.query("ROLLBACK");
    }
    console.error("Error in deleteAttribute:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete attribute",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

const getAllAttributes = async (req, res) => {
  try {
    const attributes = await Attribute.findAll();

    res.status(200).json({
      success: true,
      data: attributes,
    });
  } catch (error) {
    console.error("Error fetching attributes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attributes",
      error: error.message,
    });
  }
};

const getAttributesByCategory = async (req, res) => {
  try {
    const { categoryId: rawCategoryId } = req.params;
    const categoryId = Number.parseInt(rawCategoryId, 10);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid category ID is required",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const attributes = await Attribute.findByCategory(categoryId);

    res.status(200).json({
      success: true,
      data: attributes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching attributes",
      error: error.message,
    });
  }
};

const updateMapping = async (req, res) => {
  try {
    const { categoryId, attributeIds, mappings, attributeMappings } = req.body;
    const normalizedCategoryId = Number.parseInt(categoryId, 10);
    const rawMappings = Array.isArray(attributeMappings)
      ? attributeMappings
      : Array.isArray(mappings)
        ? mappings
        : Array.isArray(attributeIds)
          ? attributeIds
          : [];
    const normalizedMappings = normalizeAttributeMappings(rawMappings);

    if (!Number.isInteger(normalizedCategoryId) || normalizedCategoryId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid category ID is required" });
    }

    const category = await Category.findById(normalizedCategoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await Attribute.syncCategoryAttributes(
      normalizedCategoryId,
      normalizedMappings,
    );

    res.status(200).json({
      success: true,
      message: "Mapping updated successfully",
    });
  } catch (error) {
    console.error("Mapping Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update mapping" });
  }
};

module.exports = {
  createAttribute,
  getAllAttributes,
  getAttributesByCategory,
  updateMapping,
  updateAttribute,
  getAttributeDependencies,
  deleteAttribute,
};
