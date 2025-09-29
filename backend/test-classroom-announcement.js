import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

async function testClassroomAnnouncementAPI() {
  console.log('Testing Classroom Announcement API...');
  
  try {
    // Test data for the announcement
    const testData = {
      courseName: "Test Course 123",
      announcementText: "This is a test announcement from the API integration",
      materials: "Optional test materials link"
    };

    console.log('Sending request with data:', testData);

    // Make request to our backend API
    const response = await axios.post(
      `${BASE_URL}/api/add_classroom_announcement`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('✅ Success! Response status:', response.status);
    console.log('Response data:', response.data);

  } catch (error) {
    console.error('❌ Error occurred:');
    
    if (error.response) {
      // Server responded with error status
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Error message:', error.message);
    }
  }
}

async function testDirectSmythosAPI() {
  console.log('\n=== Testing Direct Smythos API ===');
  
  try {
    const testData = {
      courseName: "Direct Test Course",
      announcementText: "Direct API test announcement",
      materials: "Direct test materials"
    };

    console.log('Sending direct request to Smythos with data:', testData);

    const response = await axios.post(
      'https://cmfw5qbmfxvnkjxgtpjoabofw.agent.a.smyth.ai/api/add_classroom_announcement',
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ Direct Smythos Success! Response status:', response.status);
    console.log('Response data:', response.data);

  } catch (error) {
    console.error('❌ Direct Smythos Error:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

// Run the tests
async function runAllTests() {
  console.log('🚀 Starting Classroom Announcement Integration Tests\n');
  
  // Test 1: Backend API endpoint
  console.log('=== Test 1: Backend API Endpoint ===');
  await testClassroomAnnouncementAPI();
  
  // Test 2: Direct Smythos API
  await testDirectSmythosAPI();
  
  console.log('\n✨ All tests completed!');
}

runAllTests().catch(console.error);