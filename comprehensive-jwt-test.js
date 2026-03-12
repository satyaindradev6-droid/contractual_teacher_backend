const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

console.log('=== JWT Expiration Investigation ===');
console.log('JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');
console.log('JWT_EXPIRES_IN:', JWT_EXPIRES_IN);
console.log('Current time:', new Date().toISOString());
console.log('');

// Test 1: Create token and check its properties
console.log('Test 1: Creating token...');
const payload = {
  userId: '123',
  mobile_no: '1234567890',
  updated_at: new Date().toISOString()
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
const decoded = jwt.decode(token);

console.log('Token payload:', {
  iat: decoded.iat,
  exp: decoded.exp,
  issuedAt: new Date(decoded.iat * 1000).toISOString(),
  expiresAt: new Date(decoded.exp * 1000).toISOString(),
  durationSeconds: decoded.exp - decoded.iat
});

// Test 2: Immediate verification
console.log('\nTest 2: Immediate verification...');
try {
  const verified = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token is valid immediately');
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

// Test 3: Check if token has expiration
console.log('\nTest 3: Token expiration check...');
if (decoded.exp) {
  const timeUntilExpiration = decoded.exp * 1000 - Date.now();
  console.log('Time until expiration:', Math.round(timeUntilExpiration / 1000), 'seconds');
  
  if (timeUntilExpiration > 0) {
    console.log('Token will expire at:', new Date(decoded.exp * 1000).toISOString());
  } else {
    console.log('Token is already expired!');
  }
} else {
  console.log('❌ Token has NO expiration (exp field missing)');
}

// Test 4: Manual expiration test
console.log('\nTest 4: Testing expiration behavior...');
console.log('Waiting for token to expire...');

function checkTokenExpiration() {
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    const timeLeft = Math.round((decoded.exp * 1000 - Date.now()) / 1000);
    console.log(`Token still valid. Time left: ${timeLeft} seconds`);
    
    if (timeLeft > -5) { // Continue checking for 5 seconds after expiration
      setTimeout(checkTokenExpiration, 5000); // Check every 5 seconds
    }
  } catch (error) {
    console.log('Token verification result:', {
      error: error.message,
      errorName: error.name,
      timestamp: new Date().toISOString()
    });
    
    if (error.name === 'TokenExpiredError') {
      console.log('✅ Token correctly expired!');
    } else {
      console.log('❌ Unexpected error type');
    }
  }
}

checkTokenExpiration();

// Test 5: Create token with different expiration formats
console.log('\nTest 5: Testing different expiration formats...');
const testExpirations = ['10s', '1m', '1h'];

testExpirations.forEach(exp => {
  try {
    const testToken = jwt.sign({ test: true }, JWT_SECRET, { expiresIn: exp });
    const testDecoded = jwt.decode(testToken);
    console.log(`${exp}:`, {
      expiresAt: new Date(testDecoded.exp * 1000).toISOString(),
      durationSeconds: testDecoded.exp - testDecoded.iat
    });
  } catch (error) {
    console.log(`${exp}: Error -`, error.message);
  }
});