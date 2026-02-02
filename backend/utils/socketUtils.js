// Socket utility functions for restaurant events

const emitToRestaurant = (io, restaurantId, event, data) => {
  console.log(`Emitting '${event}' to restaurant-${restaurantId}`);
  io.to(`restaurant-${restaurantId}`).emit(event, data);
};

const emitOrderToRestaurant = (io, restaurantId, orderData) => {
  console.log(`New order sent to restaurant-${restaurantId}, Order ID: ${orderData._id}`);
  io.to(`restaurant-${restaurantId}`).emit('new-order', orderData);
};

module.exports = {
  emitToRestaurant,
  emitOrderToRestaurant
};