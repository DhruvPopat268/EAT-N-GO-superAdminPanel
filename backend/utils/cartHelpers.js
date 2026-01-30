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

const findExistingCartItem = (cartItems, newItem) => {
  return cartItems.find(item => {
    // Check basic item match
    if (item.itemId.toString() !== newItem.itemId) return false;
    
    // Check selected attribute
    const itemAttr = item.selectedAttribute?.toString() || null;
    const newAttr = newItem.selectedAttribute || null;
    if (itemAttr !== newAttr) return false;
    
    // Check food type
    const existingFoodType = item.selectedFoodType || 'Regular';
    const newFoodType = newItem.selectedFoodType || 'Regular';
    if (existingFoodType !== newFoodType) return false;
    
    // Check customizations
    if (!customizationsEqual(item.selectedCustomizations, newItem.selectedCustomizations)) return false;
    
    // Check addons
    if (!addonsEqual(item.selectedAddons, newItem.selectedAddons)) return false;
    
    return true;
  });
};

const customizationsEqual = (arr1 = [], arr2 = []) => {
  if (arr1.length !== arr2.length) return false;
  
  return arr1.every(c1 => {
    const c2 = arr2.find(c => c.customizationId === c1.customizationId);
    if (!c2) return false;
    
    if (c1.selectedOptions.length !== c2.selectedOptions.length) return false;
    
    return c1.selectedOptions.every(o1 => {
      return c2.selectedOptions.some(o2 => o2.optionId === o1.optionId);
    });
  });
};

const addonsEqual = (arr1 = [], arr2 = []) => {
  if (arr1.length !== arr2.length) return false;
  
  return arr1.every(a1 => {
    return arr2.some(a2 => {
      const addonId1 = a1.addonId?.toString() || a1.addonId;
      const addonId2 = a2.addonId?.toString() || a2.addonId;
      const attr1 = a1.selectedAttribute?.toString() || null;
      const attr2 = a2.selectedAttribute || null;
      
      return addonId1 === addonId2 && attr1 === attr2;
    });
  });
};

module.exports = { isRestaurantOpen, findExistingCartItem };