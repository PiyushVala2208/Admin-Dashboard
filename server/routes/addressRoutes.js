const express = require("express");
const router = express.Router();
const {
  addAddress,
  getUserAddress,
  updateAddress,    
  deleteAddress,
} = require("../controllers/addressController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
    .get(getUserAddress)
    .post(addAddress);

router.route("/:id")
.put(updateAddress)
    .delete(deleteAddress);

module.exports = router;    
