const { calculateCartTotals } = require('./cartHelpers');

// Helper function to populate customizations and options
async function populateCustomizations(items) {
  for (const item of items) {
    if (item.selectedCustomizations?.length && item.itemId?.customizations) {
      for (const selectedCustomization of item.selectedCustomizations) {
        // Find customization in item's customizations
        const customization = item.itemId.customizations.find(
          c => c._id.toString() === selectedCustomization.customizationId
        );
        
        if (customization) {
          selectedCustomization.customizationName = customization.name;
          selectedCustomization.customizationType = customization.type;
          
          // Populate options
          if (selectedCustomization.selectedOptions?.length) {
            for (const selectedOption of selectedCustomization.selectedOptions) {
              const option = customization.options?.find(
                o => o._id.toString() === selectedOption.optionId
              );
              
              if (option) {
                selectedOption.optionName = option.label || option.name || 'Unknown Option';
                selectedOption.optionPrice = option.price || 0;
                selectedOption.optionUnit = option.unit || '';
              }
            }
          }
        }
      }
    }
  }
  
  return items;
}

// Process orders with totals and populated customizations
async function processOrdersWithTotals(orders) {
  return await Promise.all(orders.map(async (order) => {
    const orderObj = order.toObject();
    
    // Populate customizations manually
    await populateCustomizations(orderObj.items);
    
    const { processedItems, cartTotal } = calculateCartTotals(orderObj.items);
    
    // Merge populated customizations back into processed items
    processedItems.forEach((processedItem, itemIndex) => {
      if (orderObj.items[itemIndex]?.selectedCustomizations) {
        processedItem.selectedCustomizations = orderObj.items[itemIndex].selectedCustomizations.map(customization => ({
          ...customization,
          selectedOptions: customization.selectedOptions?.map(option => ({
            ...option,
            optionName: option.optionName,
            optionPrice: option.optionPrice,
            optionUnit: option.optionUnit
          }))
        }));
      }
    });
    
    return {
      ...orderObj,
      items: processedItems,
      orderTotal: cartTotal
    };
  }));
}

module.exports = { populateCustomizations, processOrdersWithTotals };