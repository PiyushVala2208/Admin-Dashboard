const pool = require("../db");

const DEFAULT_PIC = "/uploads/profiles/default.png";

const executeQuery = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error(`[Database Error]: ${err.message}`);
    throw err;
  }
};

const User = {
  findByEmail: async (email) => {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await executeQuery(query, [email]);
    return result.rows[0];
  },

  findById: async (id) => {
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await executeQuery(query, [id]);
    return result.rows[0];
  },

  save: async (userData) => {
    const {
      name,
      email,
      password,
      role,
      adminId,
      status = "Active",
    } = userData;
    const query = `
      INSERT INTO users (name, email, password, role, status, profile_pic, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id, name, email, role, status, profile_pic
    `;
    const values = [
      name,
      email,
      password,
      role || "User",
      status,
      DEFAULT_PIC,
      adminId || null,
    ];
    const result = await executeQuery(query, values);
    return result.rows[0];
  },

  mergeGuestData: async (userId, guestCart, guestWishlist) => {
    const userQuery = "SELECT cart, wishlist FROM users WHERE id = $1";
    const userRes = await executeQuery(userQuery, [userId]);

    let dbCart = Array.isArray(userRes.rows[0].cart)
      ? userRes.rows[0].cart
      : [];

    let dbWishlist = Array.isArray(userRes.rows[0].wishlist)
      ? userRes.rows[0].wishlist
      : [];

    if (guestCart && Array.isArray(guestCart)) {
      guestCart.forEach((guestItem) => {
        const existingIdx = dbCart.findIndex(
          (item) => item.id === guestItem.id,
        );
        if (existingIdx > -1) {
          dbCart[existingIdx].quantity =
            Number(dbCart[existingIdx].quantity) + Number(guestItem.quantity);
        } else {
          dbCart.push({ ...guestItem, quantity: Number(guestItem.quantity) });
        }
      });
    }

    if (guestWishlist && Array.isArray(guestWishlist)) {
      const combinedWishlist = [...dbWishlist, ...guestWishlist];
      dbWishlist = Array.from(
        new Map(combinedWishlist.map((item) => [item.id, item])).values(),
      );
    }

    const updateQuery = `
      UPDATE users 
      SET cart = $1, wishlist = $2 
      WHERE id = $3 
      RETURNING cart, wishlist
    `;
    const result = await executeQuery(updateQuery, [
      JSON.stringify(dbCart),
      JSON.stringify(dbWishlist),
      userId,
    ]);
    return result.rows[0];
  },
};

const getAllUsers = async (adminId) => {
  const query = `
    SELECT id, name, email, role, status, profile_pic 
    FROM users 
    WHERE created_by = $1 OR id = $1
    ORDER BY id ASC
  `;
  const result = await executeQuery(query, [adminId]);
  return result.rows;
};

const getUserById = async (id) => {
  const query =
    "SELECT id, name, email, role, status, profile_pic, password FROM users WHERE id = $1";
  const result = await executeQuery(query, [id]);
  return result.rows[0];
};

const deleteUser = async (id, adminId) => {
  const query = "DELETE FROM users WHERE id = $1 AND created_by = $2";
  return await executeQuery(query, [id, adminId]);
};

const updateUser = async (id, name, email, role, status, adminId) => {
  const query = `
    UPDATE users 
    SET name=$1, email=$2, role=$3, status=$4 
    WHERE id=$5 AND (created_by=$6 OR id=$5)
    RETURNING id, name, email, role, status
  `;
  const result = await executeQuery(query, [
    name,
    email,
    role,
    status,
    id,
    adminId,
  ]);
  return result.rows[0];
};

const changePassword = async (userId, hashedPass) => {
  const query = "UPDATE users SET password = $1 WHERE id = $2";
  return await executeQuery(query, [hashedPass, userId]);
};

const getSettingsByUserId = async (userId) => {
  const query = "SELECT * FROM settings WHERE user_id = $1";
  const result = await executeQuery(query, [userId]);
  return result.rows[0];
};

const updateUserSettings = async (userId, settingsData) => {
  const {
    company_name,
    company_email,
    phone,
    currency,
    darkmode,
    email_notification,
  } = settingsData;
  const query = `
    INSERT INTO settings (user_id, company_name, company_email, phone, currency, darkmode, email_notification)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      company_name = EXCLUDED.company_name,
      company_email = EXCLUDED.company_email,
      phone = EXCLUDED.phone,
      currency = EXCLUDED.currency,
      darkmode = EXCLUDED.darkmode,
      email_notification = EXCLUDED.email_notification
    RETURNING *;
  `;
  const values = [
    userId,
    company_name,
    company_email,
    phone,
    currency,
    darkmode,
    email_notification,
  ];
  const result = await executeQuery(query, values);
  return result.rows[0];
};

const updateProfilePic = async (userId, imageUrl) => {
  const query = `UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING id, profile_pic`;
  const result = await executeQuery(query, [imageUrl, userId]);
  return result.rows[0];
};

module.exports = {
  User,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  changePassword,
  getSettingsByUserId,
  updateUserSettings,
  updateProfilePic,
};
