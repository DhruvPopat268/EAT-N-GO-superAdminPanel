const express = require('express');
const router = express.Router();
const Cart = require('../usersModels/Cart');
const Item = require('../models/Item');
const Attribute = require('../models/Attribute');
const AddonItem = require('../models/AddonItem');
const Restaurant = require('../models/Restaurant');
const { verifyToken } = require('../middleware/userAuth');
const { calculateCartTotals, isRestaurantOpen, findExistingCartItem } = require('../utils/cartHelpers');

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
    const { processedItems, cartTotal } = calculateCartTotals(cartObj.items);
    cartObj.items = processedItems;

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

    if (!restaurantId || !itemId || quantity == null || typeof quantity !== 'number' || quantity < 1) {
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

    /* -------------------- Cart Validation -------------------- */
    const existingCart = await Cart.findOne({ userId });
    if (existingCart && existingCart.restaurantId.toString() !== restaurantId) {
      return res.status(400).json({
        success: false,
        code: 'CART_RESTAURANT_MISMATCH',
        message:
          'You can only add items from one restaurant at a time. Please clear your current cart first.'
      });
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
      if (!isRestaurantOpen(openTime, closeTime, currentTime)) {
        return res.status(400).json({
          success: false,
          code: 'RESTAURANT_CLOSED',
          message: `Restaurant is closed. Operating hours: ${openTime} - ${closeTime}`
        });
      }
    }

    /* -------------------- Item Checks -------------------- */
    const item = await Item.findOne({ _id: itemId, restaurantId })
      .populate({
        path: 'addons',
        select: 'attributes'
      });
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
        const addon = item.addons.find(
          addon => addon._id.toString() === selectedAddon.addonId
        );
        if (!addon) {
          return res.status(400).json({
            success: false,
            message: 'Selected addon does not belong to this item'
          });
        }
        
        if (selectedAddon.selectedAttribute) {
          const attributeExists = addon.attributes?.some(
            attr => attr.attribute.toString() === selectedAddon.selectedAttribute
          );
          if (!attributeExists) {
            return res.status(400).json({
              success: false,
              message: 'Selected attribute does not belong to the addon'
            });
          }
        }
      }
    }

    /* -------------------- Customization Validation -------------------- */
    if (selectedCustomizations?.length) {
      for (const selectedCustomization of selectedCustomizations) {
        const customization = item.customizations?.find(
          c => c._id.toString() === selectedCustomization.customizationId
        );
        if (!customization) {
          return res.status(400).json({
            success: false,
            message: 'Selected customization does not belong to this item'
          });
        }
        
        if (selectedCustomization.selectedOptions?.length) {
          for (const selectedOption of selectedCustomization.selectedOptions) {
            const optionExists = customization.options?.some(
              option => option._id.toString() === selectedOption.optionId
            );
            if (!optionExists) {
              return res.status(400).json({
                success: false,
                message: 'Selected option does not belong to this customization'
              });
            }
          }
        }
      }
    }

    /* -------------------- Cart Create / Update -------------------- */
    let cart = await Cart.findOne({ userId, restaurantId });
    if (!cart) {
      cart = new Cart({ userId, restaurantId, items: [] });
    }

    // Check if item with same configuration already exists
    const existingItem = findExistingCartItem(cart.items, {
      itemId,
      selectedAttribute,
      selectedFoodType,
      selectedCustomizations,
      selectedAddons
    });

    if (existingItem) {
      // Update quantity of existing item
      existingItem.quantity += quantity;
      
      // Update customization option quantities
      if (selectedCustomizations?.length && existingItem.selectedCustomizations?.length) {
        selectedCustomizations.forEach(newCustomization => {
          const existingCustomization = existingItem.selectedCustomizations.find(
            c => c.customizationId === newCustomization.customizationId
          );
          
          if (existingCustomization) {
            newCustomization.selectedOptions.forEach(newOption => {
              const existingOption = existingCustomization.selectedOptions.find(
                o => o.optionId === newOption.optionId
              );
              
              if (existingOption) {
                existingOption.quantity += newOption.quantity;
              }
            });
          }
        });
      }
      
      // Update addon quantities
      if (selectedAddons?.length && existingItem.selectedAddons?.length) {
        selectedAddons.forEach(newAddon => {
          const existingAddon = existingItem.selectedAddons.find(
            a => a.addonId.toString() === newAddon.addonId &&
                 (a.selectedAttribute?.toString() || null) === (newAddon.selectedAttribute || null)
          );
          
          if (existingAddon) {
            existingAddon.quantity += (newAddon.quantity || 1);
          }
        });
      }
      
      await cart.save();
      
      // Get updated populated cart
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

      const cartObj = populatedCart.toObject();
      const { processedItems, cartTotal } = calculateCartTotals(cartObj.items);
      cartObj.items = processedItems;

      return res.json({
        success: true,
        message: 'Item quantity updated in cart successfully',
        data: {
          cart: cartObj,
          cartTotal
        }
      });
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
    const { processedItems, cartTotal } = calculateCartTotals(cartObj.items);
    cartObj.items = processedItems;

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

// Replace cart with new item
router.post('/replace', verifyToken, async (req, res) => {
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

    if (!restaurantId || !itemId || quantity == null || typeof quantity !== 'number' || quantity < 1) {
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
      if (!isRestaurantOpen(openTime, closeTime, currentTime)) {
        return res.status(400).json({
          success: false,
          message: `Restaurant is closed. Operating hours: ${openTime} - ${closeTime}`
        });
      }
    }

    /* -------------------- Item Checks -------------------- */
    const item = await Item.findOne({ _id: itemId, restaurantId })
      .populate({
        path: 'addons',
        select: 'attributes'
      });
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
        const addon = item.addons.find(
          addon => addon._id.toString() === selectedAddon.addonId
        );
        if (!addon) {
          return res.status(400).json({
            success: false,
            message: 'Selected addon does not belong to this item'
          });
        }
        
        if (selectedAddon.selectedAttribute) {
          const attributeExists = addon.attributes?.some(
            attr => attr.attribute.toString() === selectedAddon.selectedAttribute
          );
          if (!attributeExists) {
            return res.status(400).json({
              success: false,
              message: 'Selected attribute does not belong to the addon'
            });
          }
        }
      }
    }

    /* -------------------- Customization Validation -------------------- */
    if (selectedCustomizations?.length) {
      for (const selectedCustomization of selectedCustomizations) {
        const customization = item.customizations?.find(
          c => c._id.toString() === selectedCustomization.customizationId
        );
        if (!customization) {
          return res.status(400).json({
            success: false,
            message: 'Selected customization does not belong to this item'
          });
        }
        
        if (selectedCustomization.selectedOptions?.length) {
          for (const selectedOption of selectedCustomization.selectedOptions) {
            const optionExists = customization.options?.some(
              option => option._id.toString() === selectedOption.optionId
            );
            if (!optionExists) {
              return res.status(400).json({
                success: false,
                message: 'Selected option does not belong to this customization'
              });
            }
          }
        }
      }
    }

    /* -------------------- Clear Cart and Add New Item -------------------- */
    await Cart.findOneAndDelete({ userId });
    
    const cart = new Cart({
      userId,
      restaurantId,
      items: [{
        itemId,
        quantity,
        selectedAttribute,
        selectedFoodType,
        selectedCustomizations,
        selectedAddons
      }]
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
    const { processedItems, cartTotal } = calculateCartTotals(cartObj.items);
    cartObj.items = processedItems;

    /* -------------------- Response -------------------- */
    res.json({
      success: true,
      message: 'Cart replaced successfully',
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
    const {
      restaurantId,
      cartItemId,
      quantity,
      selectedCustomizations = [],
      selectedAddons = []
    } = req.body;

    // Parse quantity from string to number (handles "+1", "-1", "0")
    const quantityChange = quantity ? Number(quantity) : 0;

    if (!restaurantId || !cartItemId || isNaN(quantityChange)) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, Cart Item ID, and valid quantity are required'
      });
    }

    const cart = await Cart.findOne({ userId, restaurantId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === cartItemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const cartItem = cart.items[itemIndex];

    // Update main item quantity based on increment/decrement
    cartItem.quantity += quantityChange;

    // Remove item if quantity becomes 0 or negative
    if (cartItem.quantity <= 0) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      
      const populatedCart = await Cart.findOne({ userId, restaurantId })
        .populate({
          path: 'restaurantId',
          select: 'basicInfo.restaurantName basicInfo.foodCategory'
        })
        .populate({
          path: 'items.itemId',
          select: 'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
          populate: [
            { path: 'subcategory', select: 'name' },
            { path: 'addons', select: 'category name description images currency isAvailable attributes' }
          ]
        })
        .populate({ path: 'items.selectedAttribute', select: 'name' })
        .populate({
          path: 'items.selectedAddons.addonId',
          select: 'category name description images currency isAvailable attributes',
          populate: { path: 'attributes.attribute', select: 'name' }
        })
        .populate({ path: 'items.selectedAddons.selectedAttribute', select: 'name' });

      const cartObj = populatedCart?.toObject() || { items: [] };
      const { processedItems, cartTotal } = calculateCartTotals(cartObj.items);
      cartObj.items = processedItems;

      return res.json({
        success: true,
        message: 'Item removed from cart successfully',
        data: { cart: cartObj, cartTotal }
      });
    }

    // Update customization option quantities and remove zero quantities
    if (selectedCustomizations?.length) {
      selectedCustomizations.forEach(newCustomization => {
        const existingCustomizationIndex = cartItem.selectedCustomizations?.findIndex(
          c => c.customizationId === newCustomization.customizationId
        ) ?? -1;
        
        if (existingCustomizationIndex !== -1) {
          // Update existing customization
          const existingCustomization = cartItem.selectedCustomizations[existingCustomizationIndex];
          
          if (newCustomization.selectedOptions?.length) {
            newCustomization.selectedOptions.forEach(newOption => {
              const existingOptionIndex = existingCustomization.selectedOptions.findIndex(
                o => o.optionId === newOption.optionId
              );
              
              if (existingOptionIndex !== -1) {
                // Update existing option
                if (newOption.quantity === 0) {
                  existingCustomization.selectedOptions.splice(existingOptionIndex, 1);
                } else {
                  existingCustomization.selectedOptions[existingOptionIndex].quantity = newOption.quantity;
                }
              } else if (newOption.quantity > 0) {
                // Add new option if quantity > 0
                existingCustomization.selectedOptions.push({
                  optionId: newOption.optionId,
                  quantity: newOption.quantity
                });
              }
            });
            
            // Remove customization if no options left
            if (existingCustomization.selectedOptions.length === 0) {
              cartItem.selectedCustomizations.splice(existingCustomizationIndex, 1);
            }
          }
        } else if (newCustomization.selectedOptions?.length) {
          // Add new customization if it has options with quantity > 0
          const validOptions = newCustomization.selectedOptions.filter(opt => opt.quantity > 0);
          if (validOptions.length > 0) {
            if (!cartItem.selectedCustomizations) cartItem.selectedCustomizations = [];
            cartItem.selectedCustomizations.push({
              customizationId: newCustomization.customizationId,
              selectedOptions: validOptions
            });
          }
        }
      });
    }

    // Update addon quantities and remove zero quantities
    if (selectedAddons?.length) {
      selectedAddons.forEach(newAddon => {
        const addonQuantityChange = newAddon.quantity ? Number(newAddon.quantity) : 0;
        const existingAddonIndex = cartItem.selectedAddons?.findIndex(
          a => a.addonId.toString() === newAddon.addonId &&
               (a.selectedAttribute?.toString() || null) === (newAddon.selectedAttribute || null)
        ) ?? -1;
        
        if (existingAddonIndex !== -1) {
          // Update existing addon
          cartItem.selectedAddons[existingAddonIndex].quantity += addonQuantityChange;
          if (cartItem.selectedAddons[existingAddonIndex].quantity <= 0) {
            cartItem.selectedAddons.splice(existingAddonIndex, 1);
          }
        } else if (addonQuantityChange > 0) {
          // Add new addon if quantity > 0
          if (!cartItem.selectedAddons) cartItem.selectedAddons = [];
          cartItem.selectedAddons.push({
            addonId: newAddon.addonId,
            selectedAttribute: newAddon.selectedAttribute,
            quantity: addonQuantityChange
          });
        }
      });
    }

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findOne({ userId, restaurantId })
      .populate({
        path: 'restaurantId',
        select: 'basicInfo.restaurantName basicInfo.foodCategory'
      })
      .populate({
        path: 'items.itemId',
        select: 'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
        populate: [
          { path: 'subcategory', select: 'name' },
          { path: 'addons', select: 'category name description images currency isAvailable attributes' }
        ]
      })
      .populate({ path: 'items.selectedAttribute', select: 'name' })
      .populate({
        path: 'items.selectedAddons.addonId',
        select: 'category name description images currency isAvailable attributes',
        populate: { path: 'attributes.attribute', select: 'name' }
      })
      .populate({ path: 'items.selectedAddons.selectedAttribute', select: 'name' });

    const cartObj = populatedCart.toObject();
    const { processedItems, cartTotal } = calculateCartTotals(cartObj.items);
    cartObj.items = processedItems;

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: { cart: cartObj, cartTotal }
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

    await Cart.findOneAndDelete({ userId });

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