const OrderModel = require("../models/orderModel");

const createOrder = async (req, res) => {
  try {
    if (!req.body.items || req.body.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Cannot place an order.",
      });
    }

    const orderData = {
      userId: req.user.id,
      ...req.body,
    };

    const orderId = await OrderModel.placeOrder(orderData);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId,
    });
  } catch (error) {
    console.error("Order Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while placing order",
    });
  }
};

const fetchUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await OrderModel.getUserOrders(userId);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Fetch order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your order history",
    });
  }
};

const fetchOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let order;
    if (req.originalUrl.includes("/admin/")) {
      order = await OrderModel.getOrderById(id);
    } else {
      order = await OrderModel.getOrderById(id, userId);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or unauthorized access",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Fetch Single Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching order details",
    });
  }
};

//Admin Controllers
const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await OrderModel.getAllOrdersAdmin();
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Admin Fetch Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all orders",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const updateOrder = await OrderModel.updateOrderStatus(id, status);

    if (!updateOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updateOrder,
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

module.exports = {
  createOrder,
  fetchUserOrders,
  fetchOrderDetails,
  getAllOrdersAdmin,
  updateOrderStatus,
};
