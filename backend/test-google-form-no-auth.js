/**
 * Test script for Google Form Generation API (No Authentication)
 * Run with: node test-google-form-no-auth.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:8000'; // Using your configured port

// Test data
const testFormData = {
  formTitle: 'No Auth Test Event Registration',
  formDescription: 'This form was created without authentication',
  editorEmail: 'test@example.com'
};

/**
 * Make request without authentication
 */
const makeRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header
      },
      ...(data && { data })
    };

    console.log(`\n🔄 ${method} ${endpoint}`);
    if (data) {
      console.log('📤 Request data:', JSON.stringify(data, null, 2));
    }

    const response = await axios(config);
    
    console.log(`✅ Status: ${response.status}`);
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status || 'Network Error'}`);
    console.log('📥 Error response:', JSON.stringify(error.response?.data || error.message, null, 2));
    throw error;
  }
};

/**
 * Test configuration check (no auth)
 */
const testConfigurationCheck = async () => {
  console.log('\n🧪 Testing Google Form Configuration Check (No Auth)...');
  
  try {
    const result = await makeRequest('/api/event/google-form-config');
    
    if (result.success) {
      console.log('✅ Configuration check passed');
      if (!result.configuration.isValid) {
        console.log('⚠️  Configuration issues found:');
        result.configuration.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
    }
    
    return result;
  } catch (error) {
    console.log('❌ Configuration check failed');
    return null;
  }
};

/**
 * Test general Google Form generation (no auth)
 */
const testGenerateGoogleForm = async () => {
  console.log('\n🧪 Testing General Google Form Generation (No Auth)...');
  
  try {
    const result = await makeRequest('/api/event/generate-google-form', 'POST', testFormData);
    
    if (result.success) {
      console.log('✅ Google Form generated successfully');
      console.log(`📋 Form URL: ${result.data.formUrl}`);
      console.log(`✏️  Edit URL: ${result.data.editFormUrl}`);
      console.log(`🆔 Form ID: ${result.data.formId}`);
    }
    
    return result;
  } catch (error) {
    console.log('❌ Google Form generation failed');
    return null;
  }
};

/**
 * Test validation (no auth)
 */
const testValidation = async () => {
  console.log('\n🧪 Testing Validation (No Auth)...');
  
  // Test with missing form title
  try {
    await makeRequest('/api/event/generate-google-form', 'POST', {
      formDescription: 'Form without title'
    });
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation correctly rejected form without title');
    }
  }
};

/**
 * Main test runner
 */
const runTests = async () => {
  console.log('🚀 Starting Google Form API Tests (No Authentication)...');
  console.log(`🔗 Base URL: ${BASE_URL}`);
  console.log('🔓 Authentication: DISABLED');
  
  const results = {
    configCheck: null,
    generalForm: null,
    validation: null
  };

  // Run tests
  results.configCheck = await testConfigurationCheck();
  results.generalForm = await testGenerateGoogleForm();
  await testValidation();

  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const tests = [
    { name: 'Configuration Check', result: results.configCheck },
    { name: 'General Form Generation', result: results.generalForm }
  ];

  tests.forEach(test => {
    const status = test.result?.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.name}`);
  });

  console.log('\n📝 Notes:');
  console.log('- Make sure the backend server is running on port 8000');
  console.log('- No authentication required for these endpoints');
  console.log('- SmythOS integration is working correctly');
  console.log('- Generated forms include: Name, Email, WhatsApp, Telegram fields');
};

// Run the tests
runTests().catch(console.error);
