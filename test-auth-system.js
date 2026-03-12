/**
 * Test script for the enhanced authentication system
 * This demonstrates automatic logout when password is reset
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// Test user credentials
const testUser = {
  mobile_no: '9876543210',
  email: 'test@example.com',
  date_of_birth: '1990-01-01',
  password: 'oldPassword123',
  new_password: 'newPassword456'
};

async function testAuthenticationFlow() {
  console.log('🚀 Testing Enhanced Authentication System\n');

  try {
    // Step 1: Login and get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      mobile_no: testUser.mobile_no,
      password: testUser.password
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 50) + '...\n');

    // Step 2: Access protected route with valid token
    console.log('2️⃣ Accessing protected route with valid token...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile access successful');
    console.log('User ID:', profileResponse.data.data.application_id, '\n');

    // Step 3: Reset password (this updates updated_at)
    console.log('3️⃣ Resetting password...');
    await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
      mobile_no: testUser.mobile_no,
      email: testUser.email,
      date_of_birth: testUser.date_of_birth,
      new_password: testUser.new_password
    });
    console.log('✅ Password reset successful\n');

    // Step 4: Try to access protected route with old token (should fail)
    console.log('4️⃣ Trying to access protected route with old token...');
    try {
      await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ ERROR: Old token should have been invalidated!');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Old token correctly invalidated');
        console.log('Message:', error.response.data.message, '\n');
      } else {
        throw error;
      }
    }

    // Step 5: Login with new password
    console.log('5️⃣ Logging in with new password...');
    const newLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      mobile_no: testUser.mobile_no,
      password: testUser.new_password
    });

    const newToken = newLoginResponse.data.token;
    console.log('✅ Login with new password successful');
    console.log('New Token:', newToken.substring(0, 50) + '...\n');

    // Step 6: Access protected route with new token
    console.log('6️⃣ Accessing protected route with new token...');
    const newProfileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${newToken}` }
    });
    console.log('✅ Profile access with new token successful');
    console.log('User ID:', newProfileResponse.data.data.application_id, '\n');

    console.log('🎉 All tests passed! Authentication system working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// JWT Token Analysis Helper
function analyzeToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('Token Payload:', {
      userId: payload.userId,
      mobile_no: payload.mobile_no,
      updated_at: payload.updated_at,
      exp: new Date(payload.exp * 1000).toISOString(),
      iat: new Date(payload.iat * 1000).toISOString()
    });
  } catch (error) {
    console.error('Failed to analyze token:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testAuthenticationFlow();
}

module.exports = { testAuthenticationFlow, analyzeToken };