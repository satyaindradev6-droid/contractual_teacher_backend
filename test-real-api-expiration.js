const axios = require('axios');

// Test real API token expiration
// Make sure your server is running on port 8000

const API_BASE = 'http://localhost:8000/api';

async function testTokenExpiration() {
  console.log('=== Real API Token Expiration Test ===');
  console.log('Make sure your server is running on port 8000');
  console.log('');

  try {
    // Step 1: Login to get a token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      mobile_no: 'YOUR_MOBILE_NUMBER', // Replace with actual mobile number
      password: 'YOUR_PASSWORD'        // Replace with actual password
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token received (first 50 chars):', token.substring(0, 50) + '...');

    // Step 2: Test token immediately
    console.log('\nStep 2: Testing token immediately...');
    try {
      const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Token works immediately');
    } catch (error) {
      console.log('❌ Token failed immediately:', error.response?.data?.message);
      return;
    }

    // Step 3: Wait and test periodically
    console.log('\nStep 3: Testing token every 30 seconds...');
    console.log('Token should expire after 1 minute (60 seconds)');
    
    let testCount = 0;
    const testInterval = setInterval(async () => {
      testCount++;
      const timeElapsed = testCount * 30;
      
      try {
        const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(`✅ ${timeElapsed}s: Token still valid`);
        
        if (timeElapsed >= 120) { // Stop after 2 minutes
          clearInterval(testInterval);
          console.log('❌ Token should have expired by now!');
        }
      } catch (error) {
        console.log(`❌ ${timeElapsed}s: Token expired -`, error.response?.data?.message);
        clearInterval(testInterval);
        
        if (timeElapsed >= 60) {
          console.log('✅ Token correctly expired after expected time');
        } else {
          console.log('⚠️ Token expired earlier than expected');
        }
      }
    }, 30000); // Test every 30 seconds

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
  }
}

// Alternative: Test with a specific token
async function testSpecificToken(token) {
  console.log('=== Testing Specific Token ===');
  console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
  
  let testCount = 0;
  const testInterval = setInterval(async () => {
    testCount++;
    const timeElapsed = testCount * 10;
    
    try {
      const response = await axios.get(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`✅ ${timeElapsed}s: Token still valid`);
    } catch (error) {
      console.log(`❌ ${timeElapsed}s: Token failed -`, error.response?.data?.message);
      clearInterval(testInterval);
    }
    
    if (timeElapsed >= 120) {
      clearInterval(testInterval);
      console.log('Test completed');
    }
  }, 10000); // Test every 10 seconds
}

// Run the test
console.log('Choose test method:');
console.log('1. Full login test (requires valid credentials)');
console.log('2. Test specific token (paste token when prompted)');

// For now, run the login test
// You'll need to update the credentials above
testTokenExpiration();

// To test a specific token, uncomment this:
// const specificToken = 'PASTE_YOUR_TOKEN_HERE';
// testSpecificToken(specificToken);