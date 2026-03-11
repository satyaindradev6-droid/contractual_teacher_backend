const axios = require('axios');

// Test the new active schools API
async function testActiveSchoolsAPI() {
  try {
    console.log('Testing GET /api/invitation/active-schools...\n');
    
    const response = await axios.get('http://localhost:3000/api/invitation/active-schools');
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Validate response structure
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log('\n✅ API Response Structure Valid');
      console.log(`📊 Found ${response.data.data.length} active schools`);
      
      // Check first school structure if exists
      if (response.data.data.length > 0) {
        const firstSchool = response.data.data[0];
        console.log('\n📋 First School Structure:');
        console.log('- Has school_details:', !!firstSchool.school_details);
        console.log('- Has eligibility:', !!firstSchool.eligibility);
        console.log('- Has application_period:', !!firstSchool.eligibility?.application_period);
        console.log('- Eligible:', firstSchool.eligibility?.eligible);
        console.log('- Reason:', firstSchool.eligibility?.reason);
        console.log('- Days remaining:', firstSchool.eligibility?.application_period?.days_remaining);
      }
    } else {
      console.log('❌ Invalid response structure');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testActiveSchoolsAPI();