const calculateCartTotals = (cartItems) => {
  let cartTotal = 0;

  const processedItems = cartItems.map(item => {
    const itemObj = item.toObject ? item.toObject() : item;
    let itemPrice = 0;
    let customizationTotal = 0;
    let addonsTotal = 0;

    // Item attribute price
    if (itemObj.selectedAttribute && itemObj.itemId?.attributes) {
      const attr = itemObj.itemId.attributes.find(
        a => a.attribute.toString() === itemObj.selectedAttribute._id.toString()
      );
      itemPrice = attr?.price || 0;
    }

    // Customizations
    if (itemObj.selectedCustomizations?.length && itemObj.itemId?.customizations) {
      itemObj.selectedCustomizations.forEach(customization => {
        const itemCustomization = itemObj.itemId.customizations.find(
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

    const itemTotal = (itemPrice + customizationTotal) * itemObj.quantity;
    cartTotal += itemTotal;

    // Addons
    let processedAddons = [];
    if (itemObj.selectedAddons?.length) {
      processedAddons = itemObj.selectedAddons.map(selectedAddon => {
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
            addonTotal = (addonAttr.price || 0) * (selectedAddon.quantity || 1);
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
      ...itemObj,
      itemTotal,
      customizationTotal,
      addonsTotal,
      selectedAddons: processedAddons
    };
  });

  return { processedItems, cartTotal };
};

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const isRestaurantOpen = (openTime, closeTime, currentTime) => {
  const openMin = timeToMinutes(openTime);
  const closeMin = timeToMinutes(closeTime);
  const currentMin = timeToMinutes(currentTime);
  
  return openMin <= closeMin 
    ? currentMin >= openMin && currentMin <= closeMin
    : currentMin >= openMin || currentMin <= closeMin;
};

module.exports = { calculateCartTotals, isRestaurantOpen };