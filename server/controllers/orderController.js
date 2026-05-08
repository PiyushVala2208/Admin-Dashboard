const OrderModel = require("../models/orderModel");

const createOrder = async (req, res) => {
  try {
    const { cartItems, shippingAddress, totalAmount, paymentMethod } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please add items before checking out.",
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address and phone number are required.",
      });
    }

    const orderData = {
      userId: req.user.id,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod || "COD",
      cartItems: cartItems.map((item) => ({
        id: item.id,
        variant_id: item.variant_id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      })),
      shippingAddress: {
        fullName: shippingAddress.fullName || req.user.name,
        address: shippingAddress.address,
        city: shippingAddress.city,
        pincode: shippingAddress.pincode,
        phone: shippingAddress.phone,
      },
    };

    const orderId = await OrderModel.placeOrder(orderData);

    res.status(201).json({
      success: true,
      message: "Order placed successfully! 🥂",
      orderId,
    });
  } catch (error) {
    console.error("Critical Order Controller Error:", error.message);

    if (
      error.message.includes("Stock out") ||
      error.message.includes("Insufficient stock") ||
      error.message.includes("Variant not found")
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message:
        "We encountered a technical issue while processing your order. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
