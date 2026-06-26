const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const settingsRoutes = require('./routes/settings');
const exportRoutes = require('./routes/export');
const generationRoutes = require('./routes/generation');
const analyticsRoutes = require('./routes/analytics');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware Config
app.use(cors()); // Enables cross-origin sharing for frontend web client queries
app.use(express.json()); // Automatically parses incoming application/json bodies

app.use((req, res, next) => {
  console.log(`[API REQUEST] ${req.method} ${req.url}`);
  next();
});

// API Router Mounts
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/generations', generationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Simple baseline API status check
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    message: 'AI Customer Segment Profitability Analyzer API is running successfully',
    timestamp: new Date()
  });
});

// Centralized error interceptor middleware (Must be declared AFTER routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
