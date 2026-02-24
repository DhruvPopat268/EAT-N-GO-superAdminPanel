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
        "https://restaurant.eatngo.in"
      ],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Join restaurant room
    socket.on('join-restaurant', (restaurantId) => {
      if (!restaurantId) {
        console.log('❌ No restaurantId provided for socket:', socket.id);
        socket.emit('error', { message: 'Restaurant ID is required' });
        return;
      }
      
      socket.join(`restaurant-${restaurantId}`);
      console.log(`✅ Socket ${socket.id} joined restaurant-${restaurantId}`);
      socket.emit('joined', { restaurantId, room: `restaurant-${restaurantId}` });
    });

    // Handle order updates from restaurant
    socket.on('order-update', (data) => {
      const { restaurantId, orderData } = data;

      if (restaurantId) {
        socket.to(`restaurant-${restaurantId}`).emit('order-updated', orderData);
        console.log(`📤 Order update sent to restaurant-${restaurantId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = initializeSocket;