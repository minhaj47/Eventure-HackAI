import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

async function testBloodCollectionCourse() {
  console.log('🩸 Testing Blood Collection Course Announcement...');
  
  try {
    // Test data for blood collection course
    const testData = {
      courseName: "Blood Collection and Phlebotomy Training",
      announcementText: "Important: Tomorrow we will cover venipuncture techniques and safety protocols. Please bring your lab coats and safety goggles. Review Chapter 5 on blood collection procedures before class.",
      materials: "Lab manual pages 45-62, Safety protocol handout, Venipuncture practice kit"
    };

    console.log('📚 Course:', testData.courseName);
    console.log('📢 Announcement:', testData.announcementText);
    console.log('📝 Materials:', testData.materials);
    console.log('\n🚀 Sending request to backend...');

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

    console.log('✅ SUCCESS! Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ ERROR occurred:');
    
    if (error.response) {
      // Server responded with error status
      console.error('🚫 Status:', error.response.status);
      console.error('💥 Error Data:', error.response.data);
      console.error('📋 Headers:', error.response.headers);
    } else if (error.request) {
      // Request was made but no response received
      console.error('📡 No response received. Request details:', error.request);
    } else {
      // Something else happened
      console.error('⚠️  Error message:', error.message);
    }
    console.error('🔍 Full error:', error);
  }
}

// Test with different blood collection scenarios
async function testMultipleBloodCollectionScenarios() {
  console.log('🧪 Testing Multiple Blood Collection Scenarios\n');
  
  const scenarios = [
    {
      courseName: "Blood Collection Basics",
      announcementText: "Quiz on blood collection safety next Friday. Study infection control protocols.",
      materials: "Safety manual Chapter 3"
    },
    {
      courseName: "Advanced Phlebotomy Techniques", 
      announcementText: "Practice session for difficult draws scheduled for Monday 2 PM.",
      materials: "Practice arm models available in lab"
    },
    {
      courseName: "Pediatric Blood Collection",
      announcementText: "Special techniques for children will be demonstrated. Bring child-friendly supplies.",
      materials: "Pediatric collection kit, butterfly needles"
    }
  ];

  for (let i = 0; i < scenarios.length; i++) {
    console.log(`\n=== Test ${i + 1}: ${scenarios[i].courseName} ===`);
    
    try {
      const response = await axios.post(
        `${BASE_URL}/api/add_classroom_announcement`,
        scenarios[i],
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      console.log(`✅ Test ${i + 1} SUCCESS:`, response.data.message);
      
    } catch (error) {
      console.error(`❌ Test ${i + 1} FAILED:`, error.response?.data || error.message);
    }
    
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run the tests
async function runBloodCollectionTests() {
  console.log('🏥 Starting Blood Collection Course Tests\n');
  
  // Main test
  await testBloodCollectionCourse();
  
  console.log('\n' + '='.repeat(60));
  
  // Multiple scenarios test
  await testMultipleBloodCollectionScenarios();
  
  console.log('\n🎉 All blood collection course tests completed!');
}

runBloodCollectionTests().catch(console.error);