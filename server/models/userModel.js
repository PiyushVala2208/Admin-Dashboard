const pool = require("../db");

//Auth
const User = {
  findByEmail: async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  create: async (name, email, hashedPassword) => {
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, status, profile_pic) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, status, profile_pic",
      [
        name,
        email,
        hashedPassword,
        "Admin",
        "Active",
        defaultPic
      ],
    );
    return result.rows[0];
  },
};

// Get all users
const getAllUsers = async (adminId) => {
  return await pool.query(
    "SELECT * FROM users WHERE created_by = $1 ORDER BY id ASC",
    [adminId],
  );
};

//Get single user
const getUserById = async (id) => {
  return await pool.query("SELECT * FROM users WHERE id = $1", [id]);
};

// Create user
const createUser = async (name, email, password, role, adminId) => {
  return await pool.query(
    "INSERT INTO users (name, email, password, role, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, email, password, role, adminId],
  );
};

// Delete user
const deleteUser = async (id, adminId) => {
  return await pool.query(
    "DELETE FROM users WHERE id = $1 AND created_by = $2",
    [id, adminId],
  );
};

// Update user
const updateUser = async (id, name, email, role, status, adminId) => {
  return await pool.query(
    `UPDATE users SET name=$1, email=$2, role=$3, status=$4 WHERE id=$5 AND created_by=$6`,
    [name, email, role, status, id, adminId],
  );
};

//Change Password
const changePassword = async (userId, hashedPass) => {
  const query = "UPDATE users SET password = $1 WHERE id = $2";
  return await pool.query(query, [hashedPass, userId]);
};

// 1. Get Settings
const getSettingsByUserId = async (userId) => {
  const query = "SELECT * FROM settings WHERE user_id = $1";
  return await pool.query(query, [userId]);
};

//Update User settings
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

  return await pool.query(query, values);
};

//profile pic
const updateProfilePic = async (userId, imageUrl) => {
  const query = `
    UPDATE users 
    SET profile_pic = $1 
    WHERE id = $2 
    RETURNING id, name, email, profile_pic
  `;
  return await pool.query(query, [imageUrl, userId]);
};

module.exports = {
  User,
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
  changePassword,
  getSettingsByUserId,
  updateUserSettings,
  updateProfilePic,
};
