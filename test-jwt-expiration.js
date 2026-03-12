const jwt = require('jsonwebtoken');

// Test JWT expiration
const JWT_SECRET = 'Kvs12'; // Same as in your .env
const JWT_EXPIRES_IN = '1m'; // Same as in your .env

console.log('Testing JWT expiration...');

// Create a token
const token = jwt.sign(
  { 
    userId: '123', 
    mobile_no: '1234567890',
    updated_at: new Date().toISOString()
  },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN }
);

console.log('Token created:', token);

// Decode to check expiration time
const decoded = jwt.decode(token);
console.log('Token payload:', decoded);
console.log('Issued at:', new Date(decoded.iat * 1000));
console.log('Expires at:', new Date(decoded.exp * 1000));
console.log('Current time:', new Date());

// Test immediate verification
try {
  const verified = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token is valid immediately after creation');
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

// Test after waiting (you can uncomment this for longer testing)
console.log('\nWaiting 65 seconds to test expiration...');
setTimeout(() => {
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('❌ Token should have expired but is still valid!');
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('✅ Token correctly expired:', error.message);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}, 65000); // Wait 65 seconds (token expires in 60 seconds)