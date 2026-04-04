const {User} = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.save({
      name,
      email,
      password: hashedPassword,
      role: "User",
    });

    if (!newUser) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create user" });
    }

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_pic: user.profile_pic,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
};

exports.mergeCart = async (req, res) => {
  try {
    const { cart, wishlist } = req.body;
    const userId = req.user.id;

    if ((cart && cart.length > 0) || (wishlist && wishlist.length > 0)) {
      await User.mergeGuestData(userId, cart, wishlist);
    }

    return res.status(200).json({
      success: true,
      message: "Guest session merged with user account successfully.",
    });
  } catch (error) {
    console.error("Merge Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to merge guest data",
    });
  }
};
