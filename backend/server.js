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
    "http://localhost:3001",
    "http://localhost:5173",
    "https://eat-n-go-super-admin-panel.vercel.app",
    "https://eat-n-go-restaurent.vercel.app",
    "https://eat-n-go-restaurent-registration-fo.vercel.app",
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Connect to database
connectToDb();

// Routes
app.use('/api/restaurants', require('./routes/restaurant'));
app.use('/api/permissions', require('./routes/permission'));
app.use('/api/roles', require('./routes/role'));
app.use('/api/users', require('./routes/user'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});