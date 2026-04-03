const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", protect, adminOnly, userController.handleGetUsers);
router.post("/", protect, adminOnly, userController.handleCreateUser);

router.post(
  "/profile-pic",
  protect,
  upload.single("profile_pic"),
  userController.handleUpdateProfilePic,
);

router.put("/change-password", protect, userController.handleChangePassword);
router.get("/settings", protect, userController.handleGetSettingsByUserId);
router.put("/settings", protect, userController.handleUpdateUserSettings);

router.get("/:id", protect, adminOnly, userController.handleGetOneUser);
router.delete("/:id", protect, adminOnly, userController.handleDeleteUser);
router.put("/:id", protect, adminOnly, userController.handleUpdateUser);

module.exports = router;
