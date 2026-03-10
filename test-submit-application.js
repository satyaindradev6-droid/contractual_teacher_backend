// Test script for submit application endpoint
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testSubmitApplication() {
  try {
    console.log('Testing submit application endpoint...\n');

    // Test 1: Submit with valid application_id
    console.log('Test 1: Submitting application with application_id = 1');
    const response1 = await axios.post(`${BASE_URL}/api/submit-application`, {
      application_id: 1,
      is_submitted: 1
    });
    console.log('Response:', JSON.stringify(response1.data, null, 2));
    console.log('Status:', response1.status);
    console.log('\n---\n');

    // Test 2: Update the same application
    console.log('Test 2: Updating the same application');
    const response2 = await axios.post(`${BASE_URL}/api/submit-application`, {
      application_id: 1,
      is_submitted: 0
    });
    console.log('Response:', JSON.stringify(response2.data, null, 2));
    console.log('Status:', response2.status);
    console.log('\n---\n');

    // Test 3: Get submission
    console.log('Test 3: Getting submission for application_id = 1');
    const response3 = await axios.get(`${BASE_URL}/api/submit-application/1`);
    console.log('Response:', JSON.stringify(response3.data, null, 2));
    console.log('Status:', response3.status);
    console.log('\n---\n');

    // Test 4: Submit with non-existent application_id
    console.log('Test 4: Submitting with non-existent application_id = 999999');
    try {
      const response4 = await axios.post(`${BASE_URL}/api/submit-application`, {
        application_id: 999999,
        is_submitted: 1
      });
      console.log('Response:', JSON.stringify(response4.data, null, 2));
    } catch (error) {
      console.log('Expected error:', error.response?.data);
    }
    console.log('\n---\n');

    // Test 5: Submit without application_id
    console.log('Test 5: Submitting without application_id');
    try {
      const response5 = await axios.post(`${BASE_URL}/api/submit-application`, {
        is_submitted: 1
      });
      console.log('Response:', JSON.stringify(response5.data, null, 2));
    } catch (error) {
      console.log('Expected error:', error.response?.data);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testSubmitApplication();
