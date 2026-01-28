const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectToDb = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    "https://eat-n-go-super-admin-panel.vercel.app",
    "https://eat-n-go-restaurent.vercel.app",
    "https://eat-n-go-restaurent-registration-fo.vercel.app",
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
app.use('/api/order-requests', require('./routes/orderReqRoute'));
app.use('/api/orders', require('./routes/orderRoute'));
app.use('/api/users', require('./usersRoutes/usersRoutes'));

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});