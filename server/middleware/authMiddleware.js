const jwt = require("jsonwebtoken");
const { getUserById } = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const result = await getUserById(decoded.id);

      const user = result?.rows ? result.rows[0] : result;

      if (!user) {
        console.error(
          `[AUTH ERROR]: User with ID ${decoded.id} not found in DB.`,
        );
        return res.status(404).json({
          success: false,
          message: "User not found in database. Please login again.",
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);

      let message = "Invalid token, authorization denied";
      if (error.name === "TokenExpiredError")
        message = "Session expired, login again";

      return res.status(401).json({ success: false, message });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }
};

const adminOnly = (req, res, next) => {
  const userRole = req.user?.role?.toLowerCase();

  if (req.user && userRole === "admin") {
    next();
  } else {
    console.warn(
      `[FORBIDDEN]: Unauthorized access attempt by role: ${req.user?.role}`,
    );
    return res.status(403).json({
      success: false,
      message: "Access Denied: Admin privileges required!",
    });
  }
};

module.exports = { protect, adminOnly };
