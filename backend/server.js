const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------
// ✅ CORS Configuration (Dynamic + Safe)
// --------------------
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, mobile, Postman)
    if (!origin) return callback(null, true);

    // Your main production domain
    const allowedOrigins = [
      'https://real-time-threat.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ];

    // Automatically allow any *.vercel.app preview deployments
    const vercelPattern = /\.vercel\.app$/;

    if (
      allowedOrigins.includes(origin) ||
      vercelPattern.test(new URL(origin).hostname)
    ) {
      console.log(`✅ CORS allowed for: ${origin}`);
      return callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked request from: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// ✅ MongoDB Connection (Optional)
// --------------------
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.log('⚠️ MongoDB connection failed:', err.message));
}

// --------------------
// ✅ Routes
// --------------------
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Threat Intelligence API is running' });
});

// --------------------
// ✅ Global Error Handling
// --------------------
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

// --------------------
// ✅ Server Start
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard API available at http://localhost:${PORT}/api`);
});
