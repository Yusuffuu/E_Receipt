const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Parse comma-separated allowed origins from environment variable
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(url => url.trim())
  .filter(url => url.length > 0);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const trimmedOrigin = origin.replace(/\/$/, ''); // Remove trailing slash
    
    // Allow all Vercel subdomains (including preview deployments)
    if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(trimmedOrigin)) {
      return callback(null, true);
    }
    
    // Check against explicit allowed origins
    if (allowedOrigins.includes(trimmedOrigin)) {
      return callback(null, true);
    }
    
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const agreementRoutes = require('./routes/agreements');

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/agreements', agreementRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '511 HOMES API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 511 HOMES Backend running on port ${PORT}`);
  console.log(`📱 API URL: http://localhost:${PORT}/api`);
});