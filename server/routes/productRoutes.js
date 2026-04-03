const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.handleGetProducts);

router.get("/categories", productController.handleGetCategories);

router.get("/:id", productController.handleGetProductsDetails);

module.exports = router;