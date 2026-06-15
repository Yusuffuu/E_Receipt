const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Hardcoded login (from .env)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check against environment variables
    if (username === process.env.LANDLORD_USERNAME && 
        password === process.env.LANDLORD_PASSWORD) {
      
      // Generate JWT token
      const token = jwt.sign(
        { username, role: 'landlord' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ valid: false });
    }
    res.json({ valid: true, user });
  });
});

module.exports = router;