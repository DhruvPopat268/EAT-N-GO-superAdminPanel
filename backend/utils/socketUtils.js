// Socket utility functions for restaurant events

const emitToRestaurant = (io, restaurantId, event, data) => {
  console.log(`Emitting '${event}' to restaurant-${restaurantId}`);
  io.to(`restaurant-${restaurantId}`).emit(event, data);
};

const emitOrderToRestaurant = (io, restaurantId, orderData) => {
  console.log(`New order sent to restaurant-${restaurantId}, Order ID: ${orderData._id}`);
  io.to(`restaurant-${restaurantId}`).emit('new-order', orderData);
};

const emitOrderUpdateToRestaurant = (io, restaurantId, orderData, addedAmount, addedItemsCount) => {
  console.log(`Order update sent to restaurant-${restaurantId}, Order ID: ${orderData._id}, Added Amount: ${addedAmount}, Added Items: ${addedItemsCount}`);
  io.to(`restaurant-${restaurantId}`).emit('order-updated', {
    order: orderData,
    addedAmount,
    addedItemsCount,
    message: 'Order has been updated with new items'
  });
};

module.exports = {
  emitToRestaurant,
  emitOrderToRestaurant,
  emitOrderUpdateToRestaurant
};