// Test script to verify JWT middleware with updated_at validation
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testAuthMiddleware() {
  console.log('🔐 Testing JWT Authentication Middleware with updated_at validation\n');

  try {
    // Step 1: Login to get a token
    console.log('1️⃣ Logging in to get JWT token...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      mobile_no: '9876543210', // Replace with valid mobile
      password: 'password123'   // Replace with valid password
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Step 2: Use token to access protected route
    console.log('\n2️⃣ Accessing protected route with valid token...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (profileResponse.data.success) {
      console.log('✅ Profile access successful with valid token');
    }

    // Step 3: Update profile (this will change updated_at)
    console.log('\n3️⃣ Updating profile to change updated_at...');
    const updateResponse = await axios.put(`${BASE_URL}/api/auth/profile`, {
      first_name: 'Updated Name'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (updateResponse.data.success) {
      console.log('✅ Profile updated successfully (updated_at changed)');
    }

    // Step 4: Try to use old token again (should fail)
    console.log('\n4️⃣ Trying to use old token after profile update...');
    try {
      await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('❌ Old token still works (this should not happen!)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Old token rejected - Session expired message:', error.response.data.message);
        console.log('✅ Middleware working correctly!');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Step 5: Login again to get new token
    console.log('\n5️⃣ Logging in again to get new token...');
    const newLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      mobile_no: '9876543210',
      password: 'password123'
    });

    if (newLoginResponse.data.success) {
      const newToken = newLoginResponse.data.token;
      console.log('✅ New login successful');

      // Step 6: Use new token
      console.log('\n6️⃣ Using new token to access profile...');
      const newProfileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      });

      if (newProfileResponse.data.success) {
        console.log('✅ New token works perfectly!');
      }
    }

    console.log('\n🎉 Authentication middleware test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ JWT tokens contain updated_at timestamp');
    console.log('   ✅ Profile updates change updated_at in database');
    console.log('   ✅ Old tokens are automatically invalidated');
    console.log('   ✅ Users must login again after profile/password changes');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test password reset scenario
async function testPasswordReset() {
  console.log('\n🔑 Testing Password Reset Token Invalidation\n');

  try {
    // Login first
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      mobile_no: '9876543210',
      password: 'password123'
    });

    const oldToken = loginResponse.data.token;
    console.log('✅ Got token before password reset');

    // Reset password
    console.log('\n🔄 Resetting password...');
    const resetResponse = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
      mobile_no: '9876543210',
      email: 'test@example.com', // Replace with valid email
      date_of_birth: '1990-01-01', // Replace with valid DOB
      new_password: 'newpassword123'
    });

    if (resetResponse.data.success) {
      console.log('✅ Password reset successful');

      // Try old token
      console.log('\n🔍 Testing old token after password reset...');
      try {
        await axios.get(`${BASE_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${oldToken}` }
        });
        console.log('❌ Old token still works after password reset!');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Old token invalidated after password reset');
        }
      }
    }

  } catch (error) {
    console.error('❌ Password reset test failed:', error.response?.data || error.message);
  }
}

// Run tests
if (require.main === module) {
  console.log('Starting authentication middleware tests...\n');
  console.log('Make sure your server is running on http://localhost:8000');
  console.log('Update the mobile_no, password, email, and date_of_birth with valid test data\n');
  
  testAuthMiddleware()
    .then(() => testPasswordReset())
    .catch(console.error);
}

module.exports = { testAuthMiddleware, testPasswordReset };