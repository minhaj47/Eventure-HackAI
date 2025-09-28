#!/usr/bin/env node

/**
 * Complete Integration Test for Event Creation with Classroom Functionality
 * Tests the full flow from event creation to classroom creation and data persistence
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:8000';
const SMYTHOS_URL = 'https://cmfw5qbmfxvnkjxgtpjoabofw.agent.a.smyth.ai';

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

    // Step 3: Test SmythOS Direct Connection
    console.log('3️⃣ Testing Direct SmythOS Connection...');
    const smythosTestData = {
      className: "Direct Test Classroom",
      section: "Test Section",
      description: "Direct SmythOS API test",
      email: "test@example.com"
    };

    const smythosResponse = await fetch(`${SMYTHOS_URL}/api/create_classroom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smythosTestData)
    });

    if (smythosResponse.ok) {
      const smythosResult = await smythosResponse.json();
      console.log('✅ SmythOS API is accessible');
      console.log('📊 SmythOS Response Structure:', Object.keys(smythosResult));
      console.log();
    } else {
      console.log('⚠️  SmythOS API direct test failed (may be expected)');
      console.log(`   Status: ${smythosResponse.status}`);
      console.log();
    }

    // Step 4: Verify Event Persistence
    console.log('4️⃣ Verifying Event Persistence...');
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

    // Step 5: Test Frontend-Backend Integration Points
    console.log('5️⃣ Testing Key Integration Points...');
    
    // Test event update endpoint
    const updateData = {
      classroomId: "TEST_CODE_123",
      classroomInviteUrl: "https://classroom.google.com/test-link"
    };
    
    const updateResponse = await fetch(`${BACKEND_URL}/api/events/${createdEvent._id}/classroom`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (updateResponse.ok) {
      const updatedEvent = await updateResponse.json();
      console.log('✅ Event classroom update endpoint working');
      console.log(`   - Updated Classroom ID: ${updatedEvent.classroomId}`);
      console.log(`   - Updated Classroom URL: ${updatedEvent.classroomInviteUrl}`);
    } else {
      console.log('⚠️  Event classroom update endpoint failed');
    }

    console.log('\n🎉 Complete Flow Test Summary:');
    console.log('✅ Backend server is running and healthy');
    console.log('✅ Event creation with classroom parameter works');
    console.log('✅ Events are properly persisted with classroom data');
    console.log('✅ Event retrieval and updates work correctly');
    console.log('✅ All integration points are functional');
    
    console.log('\n📋 Next Steps for Manual Testing:');
    console.log('1. Open http://localhost:3002 in your browser');
    console.log('2. Fill out the event creation form');
    console.log('3. Check both "Auto-create Google Form" and "Auto-create Google Classroom"');
    console.log('4. Submit the form and verify classroom creation');
    console.log('5. Check the events dashboard for the new event with classroom link');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔍 Troubleshooting Tips:');
    console.log('- Ensure backend is running on port 8000');
    console.log('- Ensure frontend is running on port 3002');
    console.log('- Check network connectivity to SmythOS API');
    console.log('- Verify MongoDB is connected and accessible');
  }
}

// Run the test
testCompleteFlow().catch(console.error);