const Address = require("../models/addressModel");

exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { is_default } = req.body;

    if (is_default) {
      await Address.resetDefault(userId);
    }

    const newAddress = await Address.create(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: newAddress,
    });
  } catch (error) {
    console.error("Error in addAddress:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.findAllByUserId(userId);

    res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses,
    });
  } catch (error) {
    console.error("Error in getUserAddresses:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const { is_default } = req.body;

    if (is_default) {
      await Address.resetDefault(userId);
    }

    const updatedAddress = await Address.update(addressId, userId, req.body);

    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Error in updateAddress:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const deletedAddress = await Address.delete(addressId, userId);

    if (!deletedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteAddress:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
