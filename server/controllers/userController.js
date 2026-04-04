const {
  User,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  changePassword,
  getSettingsByUserId,
  updateUserSettings,
  updateProfilePic,
} = require("../models/userModel");
const bcrypt = require("bcryptjs");

// Get all users
const handleGetUsers = async (req, res) => {
  try {
    const result = await getAllUsers(req.user.id);
    res.json(result || []);
  } catch (err) {
    console.error("Fetch Users Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get single user
const handleGetOneUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getUserById(id, req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or access denied" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Create user
const handleCreateUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.save({
      name,
      email,
      password: hashedPassword,
      role,
      adminId: req.user.id,
    });
    res.status(201).json(user);
  } catch (err) {
    console.error("Create User Error:", err.message);
    res.status(500).json({ message: "Email already exists or invalid data" });
  }
};

// Delete user
const handleDeleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteUser(id, req.user.id);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Delete failed: User not found or unauthorized" });
    }

    res.json({ message: "User deleted successfully!" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ message: "Error deleting user" });
  }
};

// Update user
const handleUpdateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, status } = req.body;
  try {
    const result = await updateUser(id, name, email, role, status, req.user.id);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Update failed: User not found or unauthorized" });
    }

    res.json({ message: "User updated successfully!" });
  } catch (err) {
    console.error("Database Update Error:", err.message);
    res.status(500).json({ message: "Server Error during update" });
  }
};

// Change Password
const handleChangePassword = async (req, res) => {
  const { currentPass, newPass } = req.body;
  const userId = req.user?.id;

  try {
    const user = await getUserById(userId, userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(newPass, salt);

    await changePassword(userId, hashedPass);
    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Password Change Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Fetch Settings (Fix for Redirect Loop)
const handleGetSettingsByUserId = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Session invalid: User removed from DB" });
    }

    const settings = await getSettingsByUserId(userId);

    return res.status(200).json({
      id: settings?.id || null,
      company_name: settings?.company_name || "",
      company_email: settings?.company_email || "",
      phone: settings?.phone || "",
      currency: settings?.currency || "INR",
      darkmode: settings?.darkmode ?? false,
      email_notification: settings?.email_notification ?? true,
      adminName: user.name || "N/A",
      adminEmail: user.email || "N/A",
    });
  } catch (err) {
    console.error("Settings Controller Error:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update settings
const handleUpdateUserSettings = async (req, res) => {
  try {
    const result = await updateUserSettings(req.user.id, req.body);
    res.json({ message: "Settings Updated!", data: result || {} });
  } catch (err) {
    console.error("Update Settings Error:", err.message);
    res.status(500).json({ message: "Failed to update settings" });
  }
};

// Profile picture update
const handleUpdateProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Select file!!" });
    }
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    const result = await updateProfilePic(req.user.id, imageUrl);

    res.status(200).json({
      message: "Profile picture updated successfully!",
      profile_pic: result.profile_pic,
    });
  } catch (err) {
    console.error("Profile Pic Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  handleGetUsers,
  handleGetOneUser,
  handleCreateUser,
  handleDeleteUser,
  handleUpdateUser,
  handleChangePassword,
  handleGetSettingsByUserId,
  handleUpdateUserSettings,
  handleUpdateProfilePic,
};
