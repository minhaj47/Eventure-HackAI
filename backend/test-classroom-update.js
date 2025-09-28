// Test script for the new classroom update endpoint
// This demonstrates how to use the new API endpoint

const testClassroomUpdate = async () => {
  console.log('=== CLASSROOM UPDATE API TEST ===');
  
  // Example API usage:
  const eventId = "YOUR_EVENT_ID_HERE"; // Replace with actual event ID
  const apiUrl = `http://localhost:3001/api/events/update-classroom/${eventId}`;
  
  // Test data
  const testData = {
    classroomcode: "ROOM123",
    classroomlink: "https://classroom.google.com/c/abc123def456"
  };
  
  console.log('API Endpoint:', apiUrl);
  console.log('Test Data:', JSON.stringify(testData, null, 2));
  
  // Example fetch request (commented out to avoid actual execution)
  /*
  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual JWT token
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('Response:', result);
    
    if (result.success) {
      console.log('✅ Classroom information updated successfully!');
      console.log('Event ID:', result.event._id);
      console.log('Event Name:', result.event.eventName);
      console.log('Classroom Code:', result.event.classroomcode);
      console.log('Classroom Link:', result.event.classroomlink);
    } else {
      console.log('❌ Update failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  */
};

// Example CURL commands for testing:
console.log('\n=== CURL TEST COMMANDS ===');
console.log('\n1. Update both classroom code and link:');
console.log('curl -X PUT http://localhost:3001/api/events/update-classroom/EVENT_ID_HERE \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
console.log('  -d \'{"classroomcode":"ROOM123","classroomlink":"https://classroom.google.com/c/abc123"}\'');

console.log('\n2. Update only classroom code:');
console.log('curl -X PUT http://localhost:3001/api/events/update-classroom/EVENT_ID_HERE \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
console.log('  -d \'{"classroomcode":"NEWROOM456"}\'');

console.log('\n3. Update only classroom link:');
console.log('curl -X PUT http://localhost:3001/api/events/update-classroom/EVENT_ID_HERE \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
console.log('  -d \'{"classroomlink":"https://classroom.google.com/c/def456"}\'');

console.log('\n4. Clear both fields (set to empty string):');
console.log('curl -X PUT http://localhost:3001/api/events/update-classroom/EVENT_ID_HERE \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
console.log('  -d \'{"classroomcode":"","classroomlink":""}\'');

console.log('\n=== API ENDPOINT DETAILS ===');
console.log('Method: PUT');
console.log('Endpoint: /api/events/update-classroom/:eventId');
console.log('Authentication: Required (JWT token)');
console.log('Content-Type: application/json');
console.log('\nRequest Body Options:');
console.log('- classroomcode (string, optional): The classroom code');
console.log('- classroomlink (string, optional): The classroom link URL');
console.log('- At least one field must be provided');

console.log('\n=== RESPONSE FORMAT ===');
console.log('Success Response (200):');
console.log(JSON.stringify({
  success: true,
  message: "Classroom information updated successfully",
  event: {
    _id: "event_id_here",
    eventName: "Event Name",
    classroomcode: "ROOM123",
    classroomlink: "https://classroom.google.com/c/abc123",
    updatedAt: "2025-09-27T10:30:00.000Z"
  }
}, null, 2));

console.log('\nError Response (400/404/500):');
console.log(JSON.stringify({
  success: false,
  message: "Error description here"
}, null, 2));

testClassroomUpdate();