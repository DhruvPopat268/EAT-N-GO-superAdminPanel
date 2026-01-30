const express = require('express');
const router = express.Router();
const Cart = require('../usersModels/Cart');
const Item = require('../models/Item');
const Attribute = require('../models/Attribute');
const AddonItem = require('../models/AddonItem');
const Restaurant = require('../models/Restaurant');
const { verifyToken } = require('../middleware/userAuth');
const { findExistingCartItem } = require('../utils/cartHelpers');
const { isRestaurantOpen } = require('../utils/restaurantOperatingTiming');

// Get user cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId })
      .populate({
        path: 'items.itemId',
        model: 'Item',
        select: 'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
        populate: [
          {
            path: 'subcategory',
            model: 'Subcategory',
            select: 'name'
          },
          {
            path: 'attributes.attribute',
            model: 'Attribute',
            select: 'name'
          },
          {
            path: 'addons',
            model: 'AddonItem',
            select: 'category name description images currency isAvailable attributes',
            populate: {
              path: 'attributes.attribute',
              model: 'Attribute',
              select: 'name'
            }
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
        select: 'category name description images currency isAvailable'
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
          items: [],
          cartTotal: 0
        }
      });
    }

    const cartObj = cart.toObject();

    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cartObj
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

// Get cart summary (total items and cart total only)
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId });

    if (!cart || !cart.items.length) {
      return res.json({
        success: true,
        data: {
          totalItems: 0,
          cartTotal: 0
        }
      });
    }

    const totalItems = cart.items.length;

    res.json({
      success: true,
      data: {
        totalItems,
        cartTotal: cart.cartTotal || 0
      }
    });
  } catch (error) {
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

    const existingCart = await Cart.findOne({ userId });
    if (existingCart && existingCart.restaurantId.toString() !== restaurantId) {
      return res.status(400).json({
        success: false,
        code: 'CART_RESTAURANT_MISMATCH',
        message: 'You can only add items from one restaurant at a time. Please clear your current cart first.'
      });
    }

    if (restaurant.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Restaurant is not approved' });
    }

    const { openTime, closeTime } = restaurant.basicInfo?.operatingHours || {};
    if (openTime && closeTime) {
      if (!isRestaurantOpen(openTime, closeTime)) {
        return res.status(400).json({
          success: false,
          code: 'RESTAURANT_CLOSED',
          message: `Restaurant is closed. Operating hours: ${openTime} - ${closeTime}`
        });
      }
    }

    /* -------------------- Item Checks & Price Snapshot -------------------- */
    const item = await Item.findOne({ _id: itemId, restaurantId })
      .populate({ path: 'addons', select: 'attributes' });
    
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

    let selectedAttributePrice = 0;
    if (selectedAttribute) {
      const attr = item.attributes.find(attr => attr.attribute.toString() === selectedAttribute);
      if (!attr) {
        return res.status(400).json({
          success: false,
          message: 'Selected attribute does not belong to this item'
        });
      }
      selectedAttributePrice = attr.price || 0;
    }

    /* -------------------- Addon Validation & Price Snapshot -------------------- */
    let processedAddons = [];
    if (selectedAddons?.length) {
      for (const selectedAddon of selectedAddons) {
        const addon = item.addons.find(addon => addon._id.toString() === selectedAddon.addonId);
        if (!addon) {
          return res.status(400).json({
            success: false,
            message: 'Selected addon does not belong to this item'
          });
        }
        
        let addonAttributePrice = 0;
        if (selectedAddon.selectedAttribute) {
          const addonAttr = addon.attributes?.find(attr => attr.attribute.toString() === selectedAddon.selectedAttribute);
          if (!addonAttr) {
            return res.status(400).json({
              success: false,
              message: 'Selected attribute does not belong to the addon'
            });
          }
          addonAttributePrice = addonAttr.price || 0;
        }
        
        processedAddons.push({
          addonId: selectedAddon.addonId,
          selectedAttribute: selectedAddon.selectedAttribute,
          selectedAttributePrice: addonAttributePrice,
          quantity: selectedAddon.quantity || 1
        });
      }
    }

    /* -------------------- Customization Validation & Snapshot Creation -------------------- */
    let processedCustomizations = [];
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
        
        let processedOptions = [];
        if (selectedCustomization.selectedOptions?.length) {
          for (const selectedOption of selectedCustomization.selectedOptions) {
            const option = customization.options?.find(
              option => option._id.toString() === selectedOption.optionId
            );
            if (!option) {
              return res.status(400).json({
                success: false,
                message: 'Selected option does not belong to this customization'
              });
            }
            
            processedOptions.push({
              optionId: selectedOption.optionId,
              optionName: option.label,
              optionQuantity: option.quantity,
              unit: option.unit,
              price: option.price || 0,
              quantity: selectedOption.quantity || 1
            });
          }
        }
        
        processedCustomizations.push({
          customizationId: selectedCustomization.customizationId,
          customizationName: customization.name,
          customizationType: customization.type,
          isRequired: customization.isRequired,
          selectedOptions: processedOptions
        });
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
      selectedCustomizations: processedCustomizations,
      selectedAddons: processedAddons
    });

    if (existingItem) {
      // Update quantity of existing item
      existingItem.quantity += quantity;
      
      // Update customization option quantities
      if (processedCustomizations?.length && existingItem.selectedCustomizations?.length) {
        processedCustomizations.forEach(newCustomization => {
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
          path: 'items.itemId',
          model: 'Item',
          select: 'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
          populate: [
            {
              path: 'subcategory',
              model: 'Subcategory',
              select: 'name'
            },
            {
              path: 'attributes.attribute',
              model: 'Attribute',
              select: 'name'
            },
            {
              path: 'addons',
              model: 'AddonItem',
              select: 'category name description images currency isAvailable attributes',
              populate: {
                path: 'attributes.attribute',
                model: 'Attribute',
                select: 'name'
              }
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
          select: 'category name description images currency isAvailable'
        })
        .populate({
          path: 'items.selectedAddons.selectedAttribute',
          model: 'Attribute',
          select: 'name'
        });

      const cartObj = populatedCart.toObject();

      return res.json({
        success: true,
        message: 'Item quantity updated in cart successfully',
        data: cartObj
      });
    } else {
      // Calculate totals for new item
      const itemPrice = selectedAttributePrice || 0;
      let customizationTotal = 0;
      let addonTotal = 0;
      
      if (processedCustomizations?.length) {
        processedCustomizations.forEach(customization => {
          if (customization.selectedOptions?.length) {
            customization.selectedOptions.forEach(option => {
              customizationTotal += (option.price || 0) * (option.quantity || 1);
            });
          }
        });
      }
      
      if (processedAddons?.length) {
        processedAddons.forEach(addon => {
          addonTotal += (addon.selectedAttributePrice || 0) * (addon.quantity || 1);
        });
      }
      
      const itemTotal = (itemPrice + customizationTotal + addonTotal) * quantity;
      
      cart.items.push({
        itemId,
        quantity,
        selectedAttribute,
        selectedAttributePrice,
        selectedFoodType,
        selectedCustomizations: processedCustomizations,
        selectedAddons: processedAddons,
        itemTotal,
        customizationTotal,
        addonTotal
      });
      
      // Calculate cart total
      let cartTotal = 0;
      cart.items.forEach(item => {
        cartTotal += item.itemTotal || 0;
      });
      cart.cartTotal = cartTotal;
      
      await cart.save();
    }

    /* -------------------- Populate Cart -------------------- */
    const populatedCart = await Cart.findOne({ userId, restaurantId })
      .populate({
        path: 'items.itemId',
        model: 'Item',
        select: 'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
        populate: [
          {
            path: 'subcategory',
            model: 'Subcategory',
            select: 'name'
          },
          {
            path: 'attributes.attribute',
            model: 'Attribute',
            select: 'name'
          },
          {
            path: 'addons',
            model: 'AddonItem',
            select: 'category name description images currency isAvailable attributes',
            populate: {
              path: 'attributes.attribute',
              model: 'Attribute',
              select: 'name'
            }
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
        select: 'category name description images currency isAvailable'
      })
      .populate({
        path: 'items.selectedAddons.selectedAttribute',
        model: 'Attribute',
        select: 'name'
      });

    /* -------------------- Response -------------------- */
    const cartObj = populatedCart.toObject();

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: cartObj
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

    const { openTime, closeTime } = restaurant.basicInfo?.operatingHours || {};
    if (openTime && closeTime) {
      if (!isRestaurantOpen(openTime, closeTime)) {
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
    
    // Get item details for price calculation
    const itemForPricing = await Item.findById(itemId)
      .populate({ path: 'addons', select: 'attributes' });
    
    let selectedAttributePrice = 0;
    if (selectedAttribute) {
      const attr = itemForPricing.attributes.find(attr => attr.attribute.toString() === selectedAttribute);
      selectedAttributePrice = attr?.price || 0;
    }
    
    // Process addons with price snapshots
    let processedAddons = [];
    let addonTotal = 0;
    if (selectedAddons?.length) {
      for (const selectedAddon of selectedAddons) {
        const addon = itemForPricing.addons.find(addon => addon._id.toString() === selectedAddon.addonId);
        if (addon) {
          let addonAttributePrice = 0;
          if (selectedAddon.selectedAttribute) {
            const addonAttr = addon.attributes?.find(attr => attr.attribute.toString() === selectedAddon.selectedAttribute);
            addonAttributePrice = addonAttr?.price || 0;
          }
          
          processedAddons.push({
            addonId: selectedAddon.addonId,
            selectedAttribute: selectedAddon.selectedAttribute,
            selectedAttributePrice: addonAttributePrice,
            quantity: selectedAddon.quantity || 1
          });
          
          addonTotal += addonAttributePrice * (selectedAddon.quantity || 1);
        }
      }
    }
    
    // Process customizations with price snapshots
    let processedCustomizations = [];
    let customizationTotal = 0;
    if (selectedCustomizations?.length) {
      for (const selectedCustomization of selectedCustomizations) {
        const customization = itemForPricing.customizations?.find(c => c._id.toString() === selectedCustomization.customizationId);
        if (customization) {
          let processedOptions = [];
          if (selectedCustomization.selectedOptions?.length) {
            for (const selectedOption of selectedCustomization.selectedOptions) {
              const option = customization.options?.find(option => option._id.toString() === selectedOption.optionId);
              if (option) {
                processedOptions.push({
                  optionId: selectedOption.optionId,
                  optionName: option.label,
                  optionQuantity: option.quantity,
                  unit: option.unit,
                  price: option.price || 0,
                  quantity: selectedOption.quantity || 1
                });
                
                customizationTotal += (option.price || 0) * (selectedOption.quantity || 1);
              }
            }
          }
          
          processedCustomizations.push({
            customizationId: selectedCustomization.customizationId,
            customizationName: customization.name,
            customizationType: customization.type,
            isRequired: customization.isRequired,
            selectedOptions: processedOptions
          });
        }
      }
    }
    
    const itemTotal = (selectedAttributePrice + customizationTotal + addonTotal) * quantity;
    
    const cart = new Cart({
      userId,
      restaurantId,
      items: [{
        itemId,
        quantity,
        selectedAttribute,
        selectedAttributePrice,
        selectedFoodType,
        selectedCustomizations: processedCustomizations,
        selectedAddons: processedAddons,
        itemTotal,
        customizationTotal,
        addonTotal
      }],
      cartTotal: itemTotal
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

    /* -------------------- Response -------------------- */
    const cartObj = populatedCart.toObject();
    
    res.json({
      success: true,
      message: 'Cart replaced successfully',
      data: cartObj
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

// Increase cart item quantity
router.put('/increase', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      restaurantId,
      cartItemId,
      itemRepeatationStatus,
      selectedCustomizations = [],
      selectedAddons = []
    } = req.body;

    if (!restaurantId || !cartItemId || !itemRepeatationStatus) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, Cart Item ID, and itemRepeatationStatus are required'
      });
    }

    if (!['repeat_last', 'i_will_choose'].includes(itemRepeatationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'itemRepeatationStatus is not correct'
      });
    }

    const cart = await Cart.findOne({ userId, restaurantId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    if (itemRepeatationStatus === 'repeat_last') {
      // Simple quantity increase for existing item
      const itemIndex = cart.items.findIndex(item => item._id.toString() === cartItemId);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      const cartItem = cart.items[itemIndex];
      cartItem.quantity += 1;
      
      // Recalculate item total
      const basePrice = cartItem.selectedAttributePrice || 0;
      const customizationTotal = cartItem.customizationTotal || 0;
      const addonTotal = cartItem.addonTotal || 0;
      cartItem.itemTotal = (basePrice + customizationTotal + addonTotal) * cartItem.quantity;
      
      // Recalculate cart total
      cart.cartTotal = cart.items.reduce((total, item) => total + (item.itemTotal || 0), 0);
      
      await cart.save();
    } else if (itemRepeatationStatus === 'i_will_choose') {
      // Validate addon quantities (should be 1 max)
      if (selectedAddons?.length) {
        for (const selectedAddon of selectedAddons) {
          if (selectedAddon.quantity && selectedAddon.quantity > 1) {
            return res.status(400).json({
              success: false,
              message: 'Addon quantity must be 1'
            });
          }
        }
      }

      // Validate customization option quantities (should be 1 max)
      if (selectedCustomizations?.length) {
        for (const selectedCustomization of selectedCustomizations) {
          if (selectedCustomization.selectedOptions?.length) {
            for (const selectedOption of selectedCustomization.selectedOptions) {
              if (selectedOption.quantity && selectedOption.quantity > 1) {
                return res.status(400).json({
                  success: false,
                  message: 'Customization option quantity must be 1'
                });
              }
            }
          }
        }
      }

      // Check if item with same configuration already exists
      const existingItem = cart.items.find(item => item._id.toString() === cartItemId);
      if (!existingItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      console.log('Existing item found:', existingItem);
      console.log('Searching for duplicate with config:', {
        itemId: existingItem.itemId,
        selectedAttribute: req.body.selectedAttribute || existingItem.selectedAttribute,
        selectedFoodType: existingItem.selectedFoodType,
        selectedCustomizations,
        selectedAddons
      });

      const duplicateItem = findExistingCartItem(cart.items, {
        itemId: existingItem.itemId.toString(),
        selectedAttribute: (req.body.selectedAttribute || existingItem.selectedAttribute?.toString()),
        selectedFoodType: existingItem.selectedFoodType,
        selectedCustomizations,
        selectedAddons
      });

      console.log('Duplicate item found:', duplicateItem);

      if (duplicateItem) {
        console.log('Item already exists in cart, increasing quantity');
        duplicateItem.quantity += 1;
        
        // Recalculate item total
        const basePrice = duplicateItem.selectedAttributePrice || 0;
        const customizationTotal = duplicateItem.customizationTotal || 0;
        const addonTotal = duplicateItem.addonTotal || 0;
        duplicateItem.itemTotal = (basePrice + customizationTotal + addonTotal) * duplicateItem.quantity;
        
        // Recalculate cart total
        cart.cartTotal = cart.items.reduce((total, item) => total + (item.itemTotal || 0), 0);
      } else {
        console.log('No duplicate found, adding new item');
        
        // Get item details for price calculation
        const item = await Item.findById(existingItem.itemId)
          .populate({ path: 'addons', select: 'attributes' });
        
        let selectedAttributePrice = 0;
        const selectedAttr = req.body.selectedAttribute || existingItem.selectedAttribute?.toString();
        if (selectedAttr) {
          const attr = item.attributes.find(attr => attr.attribute.toString() === selectedAttr);
          selectedAttributePrice = attr?.price || 0;
        }
        
        // Process addons with price snapshots
        let processedAddons = [];
        let addonTotal = 0;
        if (selectedAddons?.length) {
          for (const selectedAddon of selectedAddons) {
            const addon = item.addons.find(addon => addon._id.toString() === selectedAddon.addonId);
            if (addon) {
              let addonAttributePrice = 0;
              if (selectedAddon.selectedAttribute) {
                const addonAttr = addon.attributes?.find(attr => attr.attribute.toString() === selectedAddon.selectedAttribute);
                addonAttributePrice = addonAttr?.price || 0;
              }
              
              processedAddons.push({
                addonId: selectedAddon.addonId,
                selectedAttribute: selectedAddon.selectedAttribute,
                selectedAttributePrice: addonAttributePrice,
                quantity: selectedAddon.quantity || 1
              });
              
              addonTotal += addonAttributePrice * (selectedAddon.quantity || 1);
            }
          }
        }
        
        // Process customizations with price snapshots
        let processedCustomizations = [];
        let customizationTotal = 0;
        if (selectedCustomizations?.length) {
          for (const selectedCustomization of selectedCustomizations) {
            const customization = item.customizations?.find(c => c._id.toString() === selectedCustomization.customizationId);
            if (customization) {
              let processedOptions = [];
              if (selectedCustomization.selectedOptions?.length) {
                for (const selectedOption of selectedCustomization.selectedOptions) {
                  const option = customization.options?.find(option => option._id.toString() === selectedOption.optionId);
                  if (option) {
                    processedOptions.push({
                      optionId: selectedOption.optionId,
                      optionName: option.label,
                      optionQuantity: option.quantity,
                      unit: option.unit,
                      price: option.price || 0,
                      quantity: selectedOption.quantity || 1
                    });
                    
                    customizationTotal += (option.price || 0) * (selectedOption.quantity || 1);
                  }
                }
              }
              
              processedCustomizations.push({
                customizationId: selectedCustomization.customizationId,
                customizationName: customization.name,
                customizationType: customization.type,
                isRequired: customization.isRequired,
                selectedOptions: processedOptions
              });
            }
          }
        }
        
        const itemTotal = (selectedAttributePrice + customizationTotal + addonTotal) * 1;
        
        cart.items.push({
          itemId: existingItem.itemId,
          quantity: 1,
          selectedAttribute: selectedAttr,
          selectedAttributePrice,
          selectedFoodType: existingItem.selectedFoodType,
          selectedCustomizations: processedCustomizations,
          selectedAddons: processedAddons,
          itemTotal,
          customizationTotal,
          addonTotal
        });
        
        // Recalculate cart total
        cart.cartTotal = cart.items.reduce((total, item) => total + (item.itemTotal || 0), 0);
      }
      await cart.save();
    }

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

    const message = itemRepeatationStatus === 'repeat_last' ? 
      'Item quantity increased successfully' : 
      'New item configuration added to cart successfully';

    res.json({
      success: true,
      message,
      data: cartObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Decrease cart item quantity
router.put('/decrease', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { restaurantId, cartItemId, quantity } = req.body;

    if (!restaurantId || !cartItemId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID and Cart Item ID are required'
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

    // Handle quantity 0 for complete removal, otherwise decrease by 1
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cartItem.quantity -= 1;
      if (cartItem.quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        // Recalculate item total
        const basePrice = cartItem.selectedAttributePrice || 0;
        const customizationTotal = cartItem.customizationTotal || 0;
        const addonTotal = cartItem.addonTotal || 0;
        cartItem.itemTotal = (basePrice + customizationTotal + addonTotal) * cartItem.quantity;
      }
    }
    
    // Recalculate cart total
    cart.cartTotal = cart.items.reduce((total, item) => total + (item.itemTotal || 0), 0);

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

    const cartObj = populatedCart?.toObject() || { items: [], cartTotal: 0 };

    const message = quantity === 0 || cartItem?.quantity <= 0 ? 
      'Item removed from cart successfully' : 
      'Item quantity decreased successfully';

    res.json({
      success: true,
      message,
      data: cartObj
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

// Update cart item
router.put('/update', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      restaurantId,
      cartItemId,
      quantity,
      selectedAttribute,
      selectedFoodType,
      selectedCustomizations = [],
      selectedAddons = []
    } = req.body;

    if (!restaurantId || !cartItemId || quantity == null || typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, Cart Item ID, and valid quantity (>= 0) are required'
      });
    }

    // Validate addon quantities (only 0 or 1 allowed)
    if (selectedAddons?.length) {
      for (const selectedAddon of selectedAddons) {
        if (selectedAddon.quantity != null && ![0, 1].includes(selectedAddon.quantity)) {
          return res.status(400).json({
            success: false,
            message: 'Addon quantity must be 0 or 1'
          });
        }
      }
    }

    // Validate customization option quantities (only 0 or 1 allowed)
    if (selectedCustomizations?.length) {
      for (const selectedCustomization of selectedCustomizations) {
        if (selectedCustomization.selectedOptions?.length) {
          for (const selectedOption of selectedCustomization.selectedOptions) {
            if (selectedOption.quantity != null && ![0, 1].includes(selectedOption.quantity)) {
              return res.status(400).json({
                success: false,
                message: 'Customization option quantity must be 0 or 1'
              });
            }
          }
        }
      }
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

    // Remove item if quantity is 0
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const cartItem = cart.items[itemIndex];
      
      // Get item details for price snapshots
      const item = await Item.findById(cartItem.itemId)
        .populate({ path: 'addons', select: 'attributes' });
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Create price snapshots for attributes
      let selectedAttributePrice = 0;
      if (selectedAttribute) {
        const attr = item.attributes.find(attr => attr.attribute.toString() === selectedAttribute);
        selectedAttributePrice = attr?.price || 0;
      }

      // Create price snapshots for addons
      let processedAddons = [];
      if (selectedAddons?.length) {
        for (const selectedAddon of selectedAddons) {
          const addon = item.addons.find(addon => addon._id.toString() === selectedAddon.addonId);
          if (addon) {
            let addonAttributePrice = 0;
            if (selectedAddon.selectedAttribute) {
              const addonAttr = addon.attributes?.find(attr => attr.attribute.toString() === selectedAddon.selectedAttribute);
              addonAttributePrice = addonAttr?.price || 0;
            }
            
            processedAddons.push({
              addonId: selectedAddon.addonId,
              selectedAttribute: selectedAddon.selectedAttribute,
              selectedAttributePrice: addonAttributePrice,
              quantity: selectedAddon.quantity || 1
            });
          }
        }
      }

      // Create customization snapshots
      let processedCustomizations = [];
      if (selectedCustomizations?.length) {
        for (const selectedCustomization of selectedCustomizations) {
          const customization = item.customizations?.find(c => c._id.toString() === selectedCustomization.customizationId);
          if (customization) {
            let processedOptions = [];
            if (selectedCustomization.selectedOptions?.length) {
              for (const selectedOption of selectedCustomization.selectedOptions) {
                const option = customization.options?.find(option => option._id.toString() === selectedOption.optionId);
                if (option) {
                  processedOptions.push({
                    optionId: selectedOption.optionId,
                    optionName: option.label,
                    optionQuantity: option.quantity,
                    unit: option.unit,
                    price: option.price || 0,
                    quantity: selectedOption.quantity || 1
                  });
                }
              }
            }
            
            processedCustomizations.push({
              customizationId: selectedCustomization.customizationId,
              customizationName: customization.name,
              customizationType: customization.type,
              isRequired: customization.isRequired,
              selectedOptions: processedOptions
            });
          }
        }
      }

      // Calculate totals
      const itemPrice = selectedAttributePrice || 0;
      let customizationTotal = 0;
      let addonTotal = 0;
      
      if (processedCustomizations?.length) {
        processedCustomizations.forEach(customization => {
          if (customization.selectedOptions?.length) {
            customization.selectedOptions.forEach(option => {
              customizationTotal += (option.price || 0) * (option.quantity || 1);
            });
          }
        });
      }
      
      if (processedAddons?.length) {
        processedAddons.forEach(addon => {
          addonTotal += (addon.selectedAttributePrice || 0) * (addon.quantity || 1);
        });
      }
      
      const itemTotal = (itemPrice + customizationTotal + addonTotal) * quantity;
      
      // Update cart item with new data
      cartItem.quantity = quantity;
      cartItem.selectedAttribute = selectedAttribute;
      cartItem.selectedAttributePrice = selectedAttributePrice;
      cartItem.selectedFoodType = selectedFoodType;
      cartItem.selectedCustomizations = processedCustomizations;
      cartItem.selectedAddons = processedAddons;
      cartItem.itemTotal = itemTotal;
      cartItem.customizationTotal = customizationTotal;
      cartItem.addonTotal = addonTotal;
    }
    
    // Recalculate cart total
    let cartTotal = 0;
    cart.items.forEach(item => {
      cartTotal += item.itemTotal || 0;
    });
    cart.cartTotal = cartTotal;

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findOne({ userId, restaurantId })
      .populate({
        path: 'items.itemId',
        model: 'Item',
        select: 'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
        populate: [
          {
            path: 'subcategory',
            model: 'Subcategory',
            select: 'name'
          },
          {
            path: 'attributes.attribute',
            model: 'Attribute',
            select: 'name'
          },
          {
            path: 'addons',
            model: 'AddonItem',
            select: 'category name description images currency isAvailable attributes',
            populate: {
              path: 'attributes.attribute',
              model: 'Attribute',
              select: 'name'
            }
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
        select: 'category name description images currency isAvailable'
      })
      .populate({
        path: 'items.selectedAddons.selectedAttribute',
        model: 'Attribute',
        select: 'name'
      });

    const cartObj = populatedCart?.toObject() || { items: [], cartTotal: 0 };

    res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart successfully' : 'Cart item updated successfully',
      data: cartObj
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