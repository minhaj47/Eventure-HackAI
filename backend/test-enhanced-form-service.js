// Test script to verify enhanced Google Form service with database integration
import mongoose from 'mongoose';
import googleFormService from '../services/googleFormService.js';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';

// Mock environment for testing
process.env.NODE_ENV = 'development';
process.env.USE_MOCK_FORMS = 'true';
process.env.MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/eventure_test';

async function testEnhancedFormService() {
    try {
        console.log('=== TESTING ENHANCED GOOGLE FORM SERVICE ===');
        
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to test database');

        // Create a test user
        const testUser = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'testpassword',
            events: []
        });
        const savedUser = await testUser.save();
        console.log('Test user created:', savedUser._id);

        // Create a test event
        const testEvent = new Event({
            eventName: 'Test Event with Enhanced Forms',
            dateTime: new Date('2025-12-01T15:00:00Z'),
            location: 'Test Location',
            eventType: 'Conference',
            description: 'Testing enhanced form integration'
        });
        const savedEvent = await testEvent.save();
        console.log('Test event created:', savedEvent._id);

        // Test enhanced form creation with database integration
        console.log('\n=== TESTING ENHANCED FORM CREATION ===');
        const formResult = await googleFormService.createEventRegistrationForm({
            title: testEvent.eventName,
            description: testEvent.description,
            organizerEmail: testUser.email,
            eventId: savedEvent._id,
            userId: savedUser._id
        });

        console.log('Form creation result:', JSON.stringify(formResult, null, 2));

        if (formResult.success) {
            console.log('✅ Form created successfully');
            console.log('✅ Database record stored:', !!formResult.databaseRecord);
            
            // Test form analytics
            if (formResult.databaseRecord && formResult.databaseRecord.formId) {
                console.log('\n=== TESTING FORM ANALYTICS ===');
                
                // Update analytics (simulate views and submissions)
                await googleFormService.updateFormAnalytics(formResult.databaseRecord.formId, 'view');
                await googleFormService.updateFormAnalytics(formResult.databaseRecord.formId, 'view');
                await googleFormService.updateFormAnalytics(formResult.databaseRecord.formId, 'submission');
                
                // Get analytics
                const analytics = await googleFormService.getFormAnalytics(formResult.databaseRecord.formId);
                console.log('Analytics result:', JSON.stringify(analytics, null, 2));

                // Test user forms
                console.log('\n=== TESTING USER FORMS ===');
                const userForms = await googleFormService.getUserForms(savedUser._id);
                console.log('User forms:', JSON.stringify(userForms, null, 2));

                // Test dashboard stats
                console.log('\n=== TESTING DASHBOARD STATS ===');
                const dashboardStats = await googleFormService.getDashboardStats(savedUser._id);
                console.log('Dashboard stats:', JSON.stringify(dashboardStats, null, 2));
            }
        } else {
            console.log('❌ Form creation failed:', formResult.error);
        }

        // Clean up test data
        await User.findByIdAndDelete(savedUser._id);
        await Event.findByIdAndDelete(savedEvent._id);
        
        // Clean up any created GoogleForm records
        if (formResult.databaseRecord) {
            const { GoogleForm } = await import('../models/googleForm.model.js');
            await GoogleForm.findOneAndDelete({ formId: formResult.databaseRecord.formId });
        }

        console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
        
    } catch (error) {
        console.error('=== TEST ERROR ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
    } finally {
        // Close database connection
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
    testEnhancedFormService();
}

export default testEnhancedFormService;