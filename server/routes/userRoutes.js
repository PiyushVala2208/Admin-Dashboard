const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", protect, userController.handleGetUsers);
router.post(
  "/profile-pic",
  protect,
  upload.single("profile_pic"),
  userController.handleUpdateProfilePic,
);
router.put("/change-password", protect, userController.handleChangePassword);
router.post("/", protect, userController.handleCreateUser);
router.get("/settings", protect, userController.handleGetSettingsByUserId);
router.put("/settings", protect, userController.handleUpdateUserSettings);
router.get("/:id", protect, userController.handleGetOneUser);
router.delete("/:id", protect, userController.handleDeleteUser);
router.put("/:id", protect, userController.handleUpdateUser);

module.exports = router;
