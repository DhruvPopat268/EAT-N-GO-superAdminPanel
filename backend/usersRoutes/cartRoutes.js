const express = require('express');
const router = express.Router();
const Cart = require('../usersModels/Cart');
const Item = require('../models/Item');
const Attribute = require('../models/Attribute');
const AddonItem = require('../models/AddonItem');
const Restaurant = require('../models/Restaurant');
const { verifyToken } = require('../middleware/userAuth');

// Get user cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId })
      .populate({
        path: 'items.itemId',
        model: 'Item',
        select:
          'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
        populate: [
          {
            path: 'subcategory',
            model: 'Subcategory',
            select: 'name'
          },
          {
            path: 'addons',
            model: 'AddonItem',
            select: 'category name description images currency isAvailable attributes'
          }
        ]
      })
      .populate({
        path: 'items.selectedAttribute',
        model: 'Attribute',
        select: 'name'
      })
      .populate({
        path: 'items.selectedAddons.addonId',
        model: 'AddonItem',
        select: 'category name description images currency isAvailable attributes',
        populate: {
          path: 'attributes.attribute',
          model: 'Attribute'
        }
      })
      .populate({
        path: 'items.selectedAddons.selectedAttribute',
        model: 'Attribute',
        select: 'name'
      });

    if (!cart || !cart.items.length) {
      return res.json({
        success: true,
        message: 'Cart is empty',
        data: {
          cart: { items: [] },
          cartTotal: 0
        }
      });
    }

    const cartObj = cart.toObject();
    let cartTotal = 0;

    cartObj.items = cartObj.items.map(item => {
      let itemPrice = 0;
      let customizationTotal = 0;
      let addonsTotal = 0;

      /* ---------------- Item Attribute Price ---------------- */
      if (item.selectedAttribute && item.itemId?.attributes) {
        const attr = item.itemId.attributes.find(
          a => a.attribute.toString() === item.selectedAttribute._id.toString()
        );
        itemPrice = attr?.price || 0;
      }

      /* ---------------- Customizations ---------------- */
      if (item.selectedCustomizations?.length && item.itemId?.customizations) {
        item.selectedCustomizations.forEach(customization => {
          const itemCustomization = item.itemId.customizations.find(
            c => c._id.toString() === customization.customizationId
          );

          if (itemCustomization) {
            customization.selectedOptions.forEach(option => {
              const opt = itemCustomization.options.find(
                o => o._id.toString() === option.optionId
              );
              if (opt) {
                customizationTotal += opt.price * option.quantity;
              }
            });
          }
        });
      }

      const itemTotal = (itemPrice + customizationTotal) * item.quantity;
      cartTotal += itemTotal;

      /* ---------------- Addons ---------------- */
      let processedAddons = [];
      if (item.selectedAddons?.length) {
        processedAddons = item.selectedAddons.map(selectedAddon => {
          let addonTotal = 0;

          if (
            selectedAddon.addonId &&
            selectedAddon.addonId.attributes &&
            selectedAddon.selectedAttribute
          ) {
            const addonAttr = selectedAddon.addonId.attributes.find(
              attr =>
                attr.attribute._id.toString() ===
                selectedAddon.selectedAttribute._id.toString()
            );

            if (addonAttr) {
              addonTotal =
                (addonAttr.price || 0) * (selectedAddon.quantity || 1);
              addonsTotal += addonTotal;
              cartTotal += addonTotal;
            }
          }

          return {
            ...selectedAddon,
            addonTotal
          };
        });
      }

      return {
        ...item,
        itemTotal,
        customizationTotal,
        addonsTotal,
        selectedAddons: processedAddons
      };
    });

    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        cart: cartObj,
        cartTotal
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Add item to cart
router.post('/add', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      restaurantId,
      itemId,
      quantity,
      selectedAttribute,
      selectedFoodType,
      selectedCustomizations = [],
      selectedAddons = []
    } = req.body;

    if (!restaurantId || !itemId || quantity == null) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, Item ID, and quantity are required'
      });
    }

    /* -------------------- Restaurant Checks -------------------- */
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    if (restaurant.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Restaurant is not approved' });
    }

    const now = new Date();
    const currentTime =
      now.getHours().toString().padStart(2, '0') +
      ':' +
      now.getMinutes().toString().padStart(2, '0');

    const { openTime, closeTime } = restaurant.basicInfo?.operatingHours || {};
    if (openTime && closeTime) {
      if (currentTime < openTime || currentTime > closeTime) {
        return res.status(400).json({
          success: false,
          message: `Restaurant is closed. Operating hours: ${openTime} - ${closeTime}`
        });
      }
    }

    /* -------------------- Item Checks -------------------- */
    const item = await Item.findOne({ _id: itemId, restaurantId });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in this restaurant'
      });
    }

    if (!item.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Item is not available'
      });
    }

    if (selectedAttribute) {
      const attributeExists = item.attributes.some(
        attr => attr.attribute.toString() === selectedAttribute
      );
      if (!attributeExists) {
        return res.status(400).json({
          success: false,
          message: 'Selected attribute does not belong to this item'
        });
      }
    }

    /* -------------------- Addon Validation -------------------- */
    if (selectedAddons?.length) {
      for (const selectedAddon of selectedAddons) {
        const addonExists = item.addons.some(
          addon => addon.toString() === selectedAddon.addonId
        );
        if (!addonExists) {
          return res.status(400).json({
            success: false,
            message: 'Selected addon does not belong to this item'
          });
        }
      }
    }

    /* -------------------- Cart Validation -------------------- */
    const existingCart = await Cart.findOne({ userId });
    if (existingCart && existingCart.restaurantId.toString() !== restaurantId) {
      return res.status(400).json({
        success: false,
        message:
          'You can only add items from one restaurant at a time. Please clear your current cart first.'
      });
    }

    /* -------------------- Cart Create / Update -------------------- */
    let cart = await Cart.findOne({ userId, restaurantId });
    if (!cart) {
      cart = new Cart({ userId, restaurantId, items: [] });
    }

    cart.items.push({
      itemId,
      quantity,
      selectedAttribute,
      selectedFoodType,
      selectedCustomizations,
      selectedAddons
    });

    await cart.save();

    /* -------------------- Populate Cart -------------------- */
    const populatedCart = await Cart.findOne({ userId, restaurantId })
      .populate({
        path: 'restaurantId',
        select: 'basicInfo.restaurantName basicInfo.foodCategory'
      })
      .populate({
        path: 'items.itemId',
        select:
          'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
        populate: [
          {
            path: 'subcategory',
            select: 'name'
          },
          {
            path: 'addons',
            select: 'category name description images currency isAvailable attributes'
          }
        ]
      })
      .populate({
        path: 'items.selectedAttribute',
        select: 'name'
      })
      .populate({
        path: 'items.selectedAddons.addonId',
        select: 'category name description images currency isAvailable attributes',
        populate: {
          path: 'attributes.attribute',
          select: 'name'
        }
      })
      .populate({
        path: 'items.selectedAddons.selectedAttribute',
        select: 'name'
      });

    /* -------------------- Calculate Totals -------------------- */
    const cartObj = populatedCart.toObject();
    let cartTotal = 0;

    cartObj.items = cartObj.items.map(item => {
      let itemPrice = 0;
      let customizationTotal = 0;
      let addonsTotal = 0;

      // Item attribute price
      if (item.selectedAttribute && item.itemId?.attributes) {
        const attr = item.itemId.attributes.find(
          a => a.attribute.toString() === item.selectedAttribute._id.toString()
        );
        itemPrice = attr?.price || 0;
      }

      // Customizations
      if (item.selectedCustomizations?.length && item.itemId?.customizations) {
        item.selectedCustomizations.forEach(customization => {
          const itemCustomization = item.itemId.customizations.find(
            c => c._id.toString() === customization.customizationId
          );

          if (itemCustomization) {
            customization.selectedOptions.forEach(option => {
              const opt = itemCustomization.options.find(
                o => o._id.toString() === option.optionId
              );
              if (opt) {
                customizationTotal += opt.price * option.quantity;
              }
            });
          }
        });
      }

      const itemTotal = (itemPrice + customizationTotal) * item.quantity;
      cartTotal += itemTotal;

      // Addons (OUTSIDE selectedAddons)
      if (item.selectedAddons?.length) {
        item.selectedAddons.forEach(selectedAddon => {
          if (
            selectedAddon.addonId &&
            selectedAddon.addonId.attributes &&
            selectedAddon.selectedAttribute
          ) {
            const addonAttr = selectedAddon.addonId.attributes.find(
              attr =>
                attr.attribute._id.toString() ===
                selectedAddon.selectedAttribute._id.toString()
            );

            if (addonAttr) {
              const addonPrice =
                (addonAttr.price || 0) * (selectedAddon.quantity || 1);
              addonsTotal += addonPrice;
              cartTotal += addonPrice;
            }
          }
        });
      }

      return {
        ...item,
        itemTotal,
        customizationTotal,
        addonsTotal,
        selectedAddons: item.selectedAddons
      };
    });

    /* -------------------- Response -------------------- */
    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart: cartObj,
        cartTotal
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update cart item quantity
router.put('/update', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { restaurantId, itemId, quantity } = req.body;

    if (!restaurantId || !itemId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, Item ID, and quantity are required'
      });
    }

    const cart = await Cart.findOne({ userId, restaurantId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item.itemId.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.json({
        success: true,
        message: 'Item removed from cart successfully',
        data: cart
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Remove item from cart
router.delete('/remove', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { restaurantId, itemId } = req.body;

    if (!restaurantId || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID and Item ID are required'
      });
    }

    const cart = await Cart.findOne({ userId, restaurantId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item.itemId.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Clear cart
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    await Cart.findOneAndDelete({ userId, restaurantId });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;