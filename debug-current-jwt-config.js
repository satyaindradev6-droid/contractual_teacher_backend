// Add this temporary route to test current JWT config
// You can add this to your authRoutes.ts for testing

const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// Temporary debug endpoint - remove after testing
router.get('/debug-jwt-config', (req, res) => {
  const testToken = jwt.sign(
    { test: 'debug' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  
  const decoded = jwt.decode(testToken);
  
  res.json({
    success: true,
    config: {
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      JWT_SECRET_SET: !!process.env.JWT_SECRET
    },
    testToken: {
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
      issuedAt: new Date(decoded.iat * 1000).toISOString(),
      timeUntilExpiration: Math.round((decoded.exp * 1000 - Date.now()) / 1000) + ' seconds'
    }
  });
});

module.exports = router;

// Or test directly:
console.log('Current JWT config:');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
console.log('Server needs restart to pick up .env changes!');