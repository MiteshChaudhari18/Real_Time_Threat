const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------
// ✅ CORS Configuration
// --------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://real-time-threat.vercel.app', // your frontend domain
];

// If FRONTEND_URL exists in .env, allow those too
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(
    ...process.env.FRONTEND_URL.split(',').map(url => url.trim())
  );
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. Postman, curl)
    if (!origin) return callback(null, true);

    // Allow matching origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked request from: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS + middleware
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

// Health check route
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
