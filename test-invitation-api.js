// Test script for the invitation eligibility API
// Usage: node test-invitation-api.js

const baseUrl = 'http://localhost:8000/api';

async function testInvitationAPI() {
  try {
    // Test with a sample kv_id
    const kv_id = 1; // Replace with actual kv_id
    
    console.log(`Testing invitation eligibility for KV ID: ${kv_id}`);
    
    const response = await fetch(`${baseUrl}/invitation/check-eligibility/${kv_id}`);
    const data = await response.json();
    
    console.log('\n=== API Response ===');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      const { eligibility, school_details, invitation_config } = data.data;
      
      console.log('\n=== Summary ===');
      console.log(`School: ${school_details?.school_name || 'Unknown'}`);
      console.log(`KV Name: ${school_details?.kv_name || 'Unknown'}`);
      console.log(`Eligible: ${eligibility.eligible ? 'YES' : 'NO'}`);
      console.log(`Reason: ${eligibility.reason}`);
      
      if (eligibility.application_period) {
        console.log(`Application Period: ${eligibility.application_period.start_date} to ${eligibility.application_period.end_date}`);
        if (eligibility.eligible) {
          console.log(`Days Remaining: ${eligibility.application_period.days_remaining}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

// Run the test
testInvitationAPI();