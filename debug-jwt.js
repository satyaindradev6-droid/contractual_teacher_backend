// Debug JWT Token Expiration
// Run this with: node debug-jwt.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

console.log('=== JWT Debug Information ===');
console.log('JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');
console.log('JWT_EXPIRES_IN:', JWT_EXPIRES_IN);
console.log('Current time:', new Date().toISOString());
console.log('');

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET not found in environment variables');
  process.exit(1);
}

// Create a test token
console.log('Creating test token...');
const payload = {
  userId: '123',
  mobile_no: '1234567890',
  updated_at: new Date().toISOString()
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
console.log('Token created successfully');

// Decode the token to see its contents
const decoded = jwt.decode(token);
console.log('');
console.log('=== Token Information ===');
console.log('Payload:', JSON.stringify(decoded, null, 2));
console.log('Issued at (iat):', new Date(decoded.iat * 1000).toISOString());
console.log('Expires at (exp):', new Date(decoded.exp * 1000).toISOString());
console.log('Time until expiration:', Math.round((decoded.exp * 1000 - Date.now()) / 1000), 'seconds');
console.log('');

// Test verification immediately
console.log('=== Immediate Verification Test ===');
try {
  const verified = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verification successful');
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

// Function to test token at intervals
function testToken() {
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    const timeLeft = Math.round((decoded.exp * 1000 - Date.now()) / 1000);
    console.log(`✅ Token still valid. Time left: ${timeLeft} seconds`);
    
    if (timeLeft > 0) {
      setTimeout(testToken, 10000); // Test every 10 seconds
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('✅ Token correctly expired!');
      console.log('Expiration time:', new Date(decoded.exp * 1000).toISOString());
      console.log('Current time:', new Date().toISOString());
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

console.log('=== Starting continuous verification test ===');
console.log('Testing token every 10 seconds...');
testToken();