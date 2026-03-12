// Test if .env file is being loaded correctly
require('dotenv').config();

console.log('=== Environment Variables Test ===');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);

// Test JWT token creation with current env
const jwt = require('jsonwebtoken');

if (process.env.JWT_SECRET && process.env.JWT_EXPIRES_IN) {
  try {
    const token = jwt.sign(
      { test: 'data' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    const decoded = jwt.decode(token);
    console.log('');
    console.log('=== JWT Test ===');
    console.log('Token created successfully');
    console.log('Expires in:', process.env.JWT_EXPIRES_IN);
    console.log('Expires at:', new Date(decoded.exp * 1000).toISOString());
  } catch (error) {
    console.log('JWT Error:', error.message);
  }
} else {
  console.log('Missing JWT environment variables');
}