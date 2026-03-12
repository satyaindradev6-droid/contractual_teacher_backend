// Add this test endpoint to your auth routes to test token expiration
// You can add this to your authRoutes.ts file

/*
// Test endpoint for token expiration
router.get('/test-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is still valid',
    userId: req.userId,
    timestamp: new Date().toISOString()
  });
});
*/

// Or create a standalone test script
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Middleware to parse JSON
app.use(express.json());

// Create a test token
app.post('/create-test-token', (req, res) => {
  const token = jwt.sign(
    { 
      userId: '123', 
      mobile_no: '1234567890',
      updated_at: new Date().toISOString()
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const decoded = jwt.decode(token);
  
  res.json({
    success: true,
    token,
    expiresAt: new Date(decoded.exp * 1000).toISOString(),
    expiresIn: JWT_EXPIRES_IN
  });
});

// Test token validity
app.post('/test-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token required'
    });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      message: 'Token is valid',
      payload: verified,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}`);
  console.log('');
  console.log('Test steps:');
  console.log('1. POST /create-test-token to get a token');
  console.log('2. POST /test-token with {"token": "your-token"} to test validity');
  console.log('3. Wait for expiration time and test again');
});