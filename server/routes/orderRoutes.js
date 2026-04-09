const express = require("express");
const router = express.Router();
const {
  createOrder,
  fetchUserOrders,
  fetchOrderDetails,
  getAllOrdersAdmin,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

//User Routes
router.post("/place", protect, createOrder);
router.get("/my-orders", protect, fetchUserOrders);

//Admin Routes
router.get("/admin/all", protect, adminOnly, getAllOrdersAdmin);
router.put("/admin/status/:id", protect, adminOnly, updateOrderStatus);
router.get("/admin/details/:id", protect, adminOnly, fetchOrderDetails);

//Dynamic Route
router.get("/:id", protect, fetchOrderDetails);

module.exports = router;
