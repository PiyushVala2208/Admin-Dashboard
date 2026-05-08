const express = require("express");
const router = express.Router();
const {
  createAttribute,
  getAllAttributes,
  getAttributesByCategory,
  updateMapping,
  updateAttribute,
  getAttributeDependencies,
  deleteAttribute,
} = require("../controllers/attributeController");

router.get("/", getAllAttributes);
router.post("/", createAttribute);
router.post("/map", updateMapping);

router.get("/category/:categoryId", getAttributesByCategory);
router.get("/:id/dependencies", getAttributeDependencies);
router.patch("/:id", updateAttribute);
router.delete("/:id", deleteAttribute);

module.exports = router;
