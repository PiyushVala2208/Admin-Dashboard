const Product = require("../models/productModel");

const productController = {
  handleGetProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const category = req.query.category || null;
      const minPrice = req.query.minPrice || null;
      const maxPrice = req.query.maxPrice || null;
      const sortBy = req.query.sortBy || "newest";

      const search = req.query.search || null;

      const offset = (page - 1) * limit;

      const products = await Product.getFilteredProducts({
        category,
        minPrice,
        maxPrice,
        sortBy,
        limit,
        offset,
        search,
      });

      const totalItems = await Product.getTotalCount({
        category,
        minPrice,
        maxPrice,
        search,
      });

      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({
        success: true,
        data: products,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
      });
    } catch (error) {
      console.error("Error in getProducts Controller:", error);
      res.status(500).json({
        success: false,
        message: "Server Error: Could not fetch products",
      });
    }
  },

  handleGetCategories: async (req, res) => {
    try {
      const categories = await Product.getAllUniqueCategories();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error("Error in getCategories Controller:", error);
      res.status(500).json({
        success: false,
        message: "Could not fetch categories",
      });
    }
  },

  handleGetProductsDetails: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      const product = await Product.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Error in handleGetProductsDetails:", error);
      res.status(500).json({
        success: false,
        message: "Server Error: Could not fetch product details",
      });
    }
  },
};

module.exports = productController;
