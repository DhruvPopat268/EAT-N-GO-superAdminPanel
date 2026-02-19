const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectToDb = require('./database/db');
const initializeSocket = require('./config/socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    "https://admin.eatngo.in",
    "https://resturant.eatngo.in"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Support x-www-form-urlencoded
app.use(cookieParser());
app.use('/downloads', express.static('public/downloads'));

// Connect to database
connectToDb();

// Routes
app.use('/api/restaurants', require('./routes/restaurant'));
app.use('/api/permissions', require('./routes/permission'));
app.use('/api/roles', require('./routes/role'));
app.use('/api/superAdmin', require('./routes/superAdmin'));
app.use('/api/activity-logs', require('./routes/activityLog'));
app.use('/api/attributes', require('./routes/attribute'));
app.use('/api/subcategories', require('./routes/subcategory'));
app.use('/api/items', require('./routes/item'));
app.use('/api/addon-items', require('./routes/addonItem'));
app.use('/api/combos', require('./routes/combo'));
app.use('/api/coupons', require('./routes/coupon'));
app.use('/api/order-requests', require('./routes/orderReqRoute'));
app.use('/api/orders', require('./routes/orderRoute'));
app.use('/api/users', require('./usersRoutes/usersRoutes'));

// Test API - Get current server time and IST time
app.get('/api/test/time', (req, res) => {
  const now = new Date();
  
  // Server timezone time
  const serverTime = now.toTimeString().slice(0, 8); // HH:MM:SS
  const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // IST time
  const istTime = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const istFullDateTime = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'long'
  });
  
  res.json({
    success: true,
    data: {
      serverTime: {
        time: serverTime,
        timezone: serverTimezone,
        fullDateTime: now.toString()
      },
      istTime: {
        time: istTime,
        timezone: 'Asia/Kolkata (IST)',
        fullDateTime: istFullDateTime
      },
      utcTime: {
        time: now.toISOString(),
        timezone: 'UTC'
      }
    }
  });
});

// Sample file download route
app.get('/api/sample/menu-items', (req, res) => {
  const path = require('path');
  const filePath = path.join(__dirname, '../frontend/vite/src/assets/files/sample_items (2).xlsx');
  res.download(filePath, 'sample_menu_items.xlsx', (err) => {
    if (err) {
      res.status(404).json({ success: false, message: 'Sample file not found' });
    }
  });
});

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible to routes
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});