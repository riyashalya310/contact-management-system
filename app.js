require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { protect } = require('./middlewares/authMiddleware');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/contacts', protect, contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
