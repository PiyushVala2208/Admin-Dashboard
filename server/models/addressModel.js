const pool = require("../db");

class Address {
  static async create(userId, data) {
    const {
      full_name,
      phone,
      pincode,
      state,
      city,
      house_info,
      area_info,
      address_type,
      is_default,
    } = data;

    const query = `
      INSERT INTO addresses 
      (user_id, full_name, phone, pincode, state, city, house_info, area_info, address_type, is_default)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const values = [
      userId,
      full_name,
      phone,
      pincode,
      state,
      city,
      house_info,
      area_info,
      address_type || "Home",
      is_default || false,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findAllByUserId(userId) {
    const query = `
      SELECT * FROM addresses 
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC;
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async resetDefault(userId) {
    const query = `
      UPDATE addresses 
      SET is_default = FALSE 
      WHERE user_id = $1 AND is_default = TRUE;
    `;

    await pool.query(query, [userId]);
  }

  static async update(addressId, userId, data) {
    const {
      full_name,
      phone,
      pincode,
      state,
      city,
      house_info,
      area_info,
      address_type,
      is_default,
    } = data;

    const query = `
      UPDATE addresses 
      SET 
        full_name = $1, 
        phone = $2, 
        pincode = $3, 
        state = $4, 
        city = $5, 
        house_info = $6, 
        area_info = $7, 
        address_type = $8, 
        is_default = $9
      WHERE id = $10 AND user_id = $11
      RETURNING *;
    `;

    const values = [
      full_name,
      phone,
      pincode,
      state,
      city,
      house_info,
      area_info,
      address_type,
      is_default,
      addressId,
      userId,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(addressId, userId) {
    const query = `
      DELETE FROM addresses 
      WHERE id = $1 AND user_id = $2 
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [addressId, userId]);
    return rows[0];
  }
}

module.exports = Address;
