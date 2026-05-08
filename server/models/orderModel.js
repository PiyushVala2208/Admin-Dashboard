const pool = require("../db");

const OrderModel = {
  async placeOrder({
    userId,
    totalAmount,
    paymentMethod,
    cartItems,
    shippingAddress,
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Order create
      const orderQuery = `
        INSERT INTO orders (user_id, total_amount, payment_method, status)
        VALUES ($1, $2, $3, 'PENDING') RETURNING id
      `;
      const orderRes = await client.query(orderQuery, [
        userId,
        parseFloat(totalAmount),
        paymentMethod,
      ]);
      const orderId = orderRes.rows[0].id;

      for (const item of cartItems) {
        const productId = item.id;
        const variantId = item.variant_id;
        let selectedVariantImage = null;

        if (variantId) {
          const variantCheck = await client.query(
            "SELECT variant_stock, size, color, variant_image FROM product_variants WHERE id = $1 FOR UPDATE",
            [variantId],
          );

          if (variantCheck.rows.length === 0) {
            throw new Error(`Variant not found for product: ${item.name}`);
          }

          const currentVariantStock = variantCheck.rows[0].variant_stock;
          selectedVariantImage = variantCheck.rows[0].variant_image || null;

          if (currentVariantStock < item.quantity) {
            throw new Error(
              `Stock out for ${item.name} (${variantCheck.rows[0].size}). Available: ${currentVariantStock}`,
            );
          }

          await client.query(
            "UPDATE product_variants SET variant_stock = variant_stock - $1 WHERE id = $2",
            [item.quantity, variantId],
          );
        } else {
          const stockCheck = await client.query(
            "SELECT stock FROM inventory WHERE id = $1 FOR UPDATE",
            [productId],
          );

          if (stockCheck.rows[0].stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.name}`);
          }

          await client.query(
            "UPDATE inventory SET stock = stock - $1 WHERE id = $2",
            [item.quantity, productId],
          );
        }

        // 3. Order Items insert
        const itemsQuery = `
          INSERT INTO order_items (order_id, product_id, variant_id, name, image, price, quantity)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await client.query(itemsQuery, [
          orderId,
          productId,
          variantId || null,
          item.name,
          selectedVariantImage || item.image,
          item.price,
          item.quantity,
        ]);
      }

      // 4. Shipping Details insert
      const shippingQuery = `
        INSERT INTO shipping_details (order_id, full_name, address, city, pincode, phone)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await client.query(shippingQuery, [
        orderId,
        shippingAddress.fullName,
        shippingAddress.address,
        shippingAddress.city,
        shippingAddress.pincode,
        shippingAddress.phone,
      ]);

      await client.query("COMMIT");
      return orderId;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Order Transaction Error:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  async getUserOrders(userId) {
    try {
      const query = `
        SELECT 
          o.id, o.total_amount, o.payment_method, o.status, o.created_at,
          s.full_name, s.address, s.city, s.pincode, s.phone,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'order_id', oi.order_id,
                'product_id', oi.product_id,
                'variant_id', oi.variant_id,
                'name', oi.name,
                'image', COALESCE(oi.image, pv.variant_image, i.image),
                'variant_image', pv.variant_image,
                'color', pv.color,
                'size', pv.size,
                'price', oi.price,
                'quantity', oi.quantity
              )
            ) FILTER (WHERE oi.id IS NOT NULL), 
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN inventory i ON oi.product_id = i.id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        LEFT JOIN shipping_details s ON o.id = s.order_id
        WHERE o.user_id = $1
        GROUP BY o.id, s.id
        ORDER BY o.created_at DESC
      `;

      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error("SQL Error (getUserOrders):", error.message);
      throw error;
    }
  },

  async getOrderById(orderId, userId) {
    try {
      const query = `
        SELECT 
          o.*, 
          u.name as customer_name,
          u.email as customer_email,
          json_build_object(
            'name', s.full_name,
            'address', s.address,
            'city', s.city,
            'pincode', s.pincode,
            'phone', s.phone
          ) as shipping_details,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'order_id', oi.order_id,
                'product_id', oi.product_id,
                'variant_id', oi.variant_id,
                'name', oi.name,
                'image', COALESCE(oi.image, pv.variant_image, i.image),
                'variant_image', pv.variant_image,
                'color', pv.color,
                'size', pv.size,
                'price', oi.price,
                'quantity', oi.quantity
              )
            ) FILTER (WHERE oi.id IS NOT NULL), 
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN inventory i ON oi.product_id = i.id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        LEFT JOIN shipping_details s ON o.id = s.order_id
        WHERE o.id = $1
        GROUP BY o.id, u.id, s.id
      `;

      const result = await pool.query(query, [orderId]);

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("SQL Error (getOrderById):", error.message);
      throw error;
    }
  },

  //Admin Functions
  async getAllOrdersAdmin() {
    try {
      const query = `
      SELECT 
        o.*, 
        u.name as customer_name, 
        u.email as customer_email,
        s.full_name, s.address, s.city, s.pincode, s.phone,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', oi.id,
            'name', COALESCE(oi.name, i.name),
            'image', COALESCE(oi.image, pv.variant_image, i.image),
            'variant_image', pv.variant_image,
            'color', pv.color,
            'size', pv.size,
            'price', oi.price,
            'quantity', oi.quantity
          ))
          FROM order_items oi
          JOIN inventory i ON oi.product_id = i.id
          LEFT JOIN product_variants pv ON oi.variant_id = pv.id
          WHERE oi.order_id = o.id
        ), '[]') as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN shipping_details s ON o.id = s.order_id
      ORDER BY o.created_at DESC
    `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("SQL Error (getAllOrdersAdmin):", error.message);
      throw error;
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      if (!orderId) throw new Error("Order ID is required");

      const numericId = parseInt(orderId);

      const query = `
      UPDATE orders 
      SET status = $1 
      WHERE id = $2 
      RETURNING *
    `;
      const result = await pool.query(query, [status, numericId]);

      if (result.rowCount === 0) return null;
      return result.rows[0];
    } catch (error) {
      console.error("SQL Error (updateOrderStatus):", error.message);
      throw error;
    }
  },
};

module.exports = OrderModel;
