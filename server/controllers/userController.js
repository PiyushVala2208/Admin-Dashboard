const {
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
} = require("../models/userModel");
const bcrypt = require("bcryptjs");

// Get all users
const handleGetUsers = async (req, res) => {
  try {
    const result = await getAllUsers(req.user.id);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get single user
const handleGetOneUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await getUserById(id, req.user.id);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "User not found or access denied" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Create user
const handleCreateUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const result = await createUser(name, email, password, role, req.user.id);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: Email already exists or invalid data");
  }
};

//Delete user
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
    console.error(err.message);
    res.status(500).send("Error deleting user");
  }
};

//Update user
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
    res.status(500).send("Server Error during update");
  }
};

//Change Password
const handleChangePassword = async (req, res) => {
  const { currentPass, newPass } = req.body;
  const userId = req.user?.id;

  try {
    const result = await getUserById(userId, userId);
    const user = result.rows[0];

    if (!user) {
      console.log("DEBUG: No user found in DB for ID:", userId);
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
    console.error("DETAILED ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

//Fetch settings
const handleGetSettingsByUserId = async (req, res) => {
  try {
    const userResult = await getUserById(req.user.id);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await getSettingsByUserId(req.user.id);

    if (result.rows.length === 0) {
      return res.json({
        company_name: "",
        company_email: "",
        phone: "",
        currency: "INR",
        darkmode: false,
        email_notification: true,
        adminName: user.name,
        adminEmail: user.email,
      });
    }

    const settingsData = {
      ...result.rows[0],
      adminName: user.name,
      adminEmail: user.email,
    };

    res.json(settingsData);
  } catch (err) {
    console.error("Fetch Settings Error:", err.message);
    res.status(500).send("Server Error");
  }
};

//Update settings
const handleUpdateUserSettings = async (req, res) => {
  try {
    const result = await updateUserSettings(req.user.id, req.body);
    res.json({ message: "Settings Updated!", data: result.rows[0] });
  } catch (err) {
    console.error("Update Settings Error:", err.message);
    res.status(500).send("Failed to update settings");
  }
};

//profile pic
const handleUpdateProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Select file!!" });
    }
    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    const result = await updateProfilePic(req.user.id, imageUrl);

    res.status(200).json({
      message: "Profile picture updated successfully!",
      profile_pic: result.rows[0].profile_pic,
    });
  } catch (err) {
    console.error("Controller Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
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
