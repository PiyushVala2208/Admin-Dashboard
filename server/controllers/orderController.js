const OrderModel = require("../models/orderModel");

const createOrder = async (req, res) => {
  try {
    const { cartItems, shippingAddress, totalAmount, paymentMethod } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const orderData = {
      userId: req.user.id,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod || "COD",
      cartItems: cartItems,
      shippingAddress: {
        fullName: shippingAddress?.fullName || "",
        address: shippingAddress?.address,
        city: shippingAddress?.city,
        pincode: shippingAddress?.pincode,
        phone: shippingAddress?.phone,
      },
    };

    const orderId = await OrderModel.placeOrder(orderData);

    res.status(201).json({
      success: true,
      message: "Order placed successfully! 🥂",
      orderId,
    });
  } catch (error) {
    console.error("Order Controller Error:", error.message);

    if (
      error.message.includes("Insufficient stock") ||
      error.message.includes("not found")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while placing your order",
      error: error.message,
    });
  }
};

const fetchUserOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getUserOrders(req.user.id);
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve orders" });
  }
};

const fetchOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdminPath = req.originalUrl.includes("/admin/");
    const order = await OrderModel.getOrderById(
      id,
      isAdminPath ? null : req.user.id,
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching order details" });
  }
};

// Admin: Get all orders
const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await OrderModel.getAllOrdersAdmin();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Admin fetch failed" });
  }
};

// Admin: Update Status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status)
      return res
        .status(400)
        .json({ success: false, message: "Status required" });

    const updatedOrder = await OrderModel.updateOrderStatus(
      id,
      status.toUpperCase(),
    );
    if (!updatedOrder)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res
      .status(200)
      .json({ success: true, message: "Status updated", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

module.exports = {
  createOrder,
  fetchUserOrders,
  fetchOrderDetails,
  getAllOrdersAdmin,
  updateOrderStatus,
};
