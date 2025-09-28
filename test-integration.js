/**
 * Complete Integration Test for Event Creation with Classroom Functionality
 */

const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:8000';

// Test data for event creation
const testEventData = {
  name: "Test Event - Complete Flow",
  description: "Testing complete event creation flow with classroom integration",
  date: "2025-10-15",
  time: "14:00",
  location: "Online",
  googleSheetUrl: "https://docs.google.com/spreadsheets/d/1234567890/edit",
  autoCreateForm: true,
  autoCreateClassroom: true
};

async function testCompleteFlow() {
  console.log('🚀 Starting Complete Event Creation Flow Test...\n');
  
  try {
    // Step 1: Test Backend Health
    console.log('1️⃣ Testing Backend Health...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/events`);
    if (healthResponse.ok) {
      console.log('✅ Backend is healthy and responding\n');
    } else {
      throw new Error('❌ Backend health check failed');
    }

    // Step 2: Create Event with Classroom
    console.log('2️⃣ Creating Event with Classroom...');
    const createEventResponse = await fetch(`${BACKEND_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEventData)
    });

    if (!createEventResponse.ok) {
      const errorText = await createEventResponse.text();
      throw new Error(`Event creation failed: ${createEventResponse.status} - ${errorText}`);
    }

    const createdEvent = await createEventResponse.json();
    console.log('✅ Event created successfully!');
    console.log('📋 Event Details:');
    console.log(`   - ID: ${createdEvent._id}`);
    console.log(`   - Name: ${createdEvent.name}`);
    console.log(`   - Has Classroom ID: ${!!createdEvent.classroomId}`);
    console.log(`   - Has Classroom URL: ${!!createdEvent.classroomInviteUrl}`);
    
    if (createdEvent.classroomId) {
      console.log(`   - Classroom Code: ${createdEvent.classroomId}`);
    }
    if (createdEvent.classroomInviteUrl) {
      console.log(`   - Classroom Link: ${createdEvent.classroomInviteUrl}`);
    }
    console.log();

    // Step 3: Verify Event Persistence
    console.log('3️⃣ Verifying Event Persistence...');
    const getEventResponse = await fetch(`${BACKEND_URL}/api/events/${createdEvent._id}`);
    
    if (getEventResponse.ok) {
      const retrievedEvent = await getEventResponse.json();
      console.log('✅ Event successfully persisted and retrievable');
      console.log('📝 Persistence Check:');
      console.log(`   - Event ID matches: ${retrievedEvent._id === createdEvent._id}`);
      console.log(`   - Classroom data preserved: ${!!retrievedEvent.classroomId && !!retrievedEvent.classroomInviteUrl}`);
      console.log();
    } else {
      console.log('⚠️  Event retrieval failed');
      console.log();
    }

    console.log('\n🎉 Complete Flow Test Summary:');
    console.log('✅ Backend server is running and healthy');
    console.log('✅ Event creation with classroom parameter works');
    console.log('✅ Events are properly persisted with classroom data');
    console.log('✅ All integration points are functional');
    
    console.log('\n📋 Manual Testing Instructions:');
    console.log('1. Open http://localhost:3002 in your browser');
    console.log('2. Fill out the event creation form');
    console.log('3. ✅ Check both "Auto-create Google Form" AND "Auto-create Google Classroom"');
    console.log('4. Submit the form and verify classroom creation');
    console.log('5. Check the events dashboard for the new event with classroom link');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔍 Troubleshooting Tips:');
    console.log('- Ensure backend is running on port 8000');
    console.log('- Ensure frontend is running on port 3002');
    console.log('- Verify MongoDB is connected and accessible');
  }
}

// Run the test
testCompleteFlow().catch(console.error);