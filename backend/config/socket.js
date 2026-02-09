const { Server } = require('socket.io');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:5173',
        "https://admin.eatngo.in",
        "https://resturant.eatngo.in"
      ],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Restaurant connected:', socket.id);

    // Join restaurant room
    socket.on('join-restaurant', (restaurantId) => {
      socket.join(`restaurant-${restaurantId}`);
      console.log(`Restaurant ${socket.id} joined restaurant-${restaurantId}`);
    });

    // Handle order updates from restaurant
    socket.on('order-update', (data) => {
      const { restaurantId, orderData } = data;

      if (restaurantId) {
        socket.to(`restaurant-${restaurantId}`).emit('order-updated', orderData);
      }
    });

    socket.on('disconnect', () => {
      console.log('Restaurant disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = initializeSocket;