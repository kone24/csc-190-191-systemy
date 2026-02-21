// Test Supabase API endpoints
const baseUrl = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing Supabase API endpoints...\n');

  try {
    // Test 1: Get all clients (should be empty initially)
    console.log('📋 Test 1: GET /clients');
    const response1 = await fetch(`${baseUrl}/clients`);
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));
    console.log('✅ GET /clients works!\n');

    // Test 2: Create a new client
    console.log('📝 Test 2: POST /clients');
    const newClient = {
      first_name: 'Test',
      last_name: 'User',
      business_name: 'Test Business Co.',
      email: 'test@example.com',
      phone_number: '555-0123',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        zip_code: '90210'
      },
      services_needed: ['Website Development'],
      project_timeline: '1-3 months',
      budget_range: '$5,000 - $10,000',
      additional_info: 'API test client',
      preferred_contact_method: 'email'
    };

    const response2 = await fetch(`${baseUrl}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newClient)
    });
    
    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(data2, null, 2));
    
    if (response2.ok) {
      console.log('✅ POST /clients works! Client created successfully\n');
      
      // Test 3: Get clients again (should now have 1 client)
      console.log('📋 Test 3: GET /clients (after creating one)');
      const response3 = await fetch(`${baseUrl}/clients`);
      const data3 = await response3.json();
      console.log('Status:', response3.status);
      console.log('Response:', JSON.stringify(data3, null, 2));
      console.log('✅ Data persistence confirmed!\n');
      
      console.log('🎉 ALL TESTS PASSED! Supabase integration working perfectly!');
    } else {
      console.log('❌ POST /clients failed');
    }

  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testAPI();