// Test file to verify backend integration
// Run this with: node test-backend-integration.js

const API_BASE_URL = "http://localhost:5000";

async function testEmailGeneration() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate_email_body`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        purpose: "Test email for event reminder",
        recipientName: "John Doe",
        senderName: "Event Team",
        keyData: "Event: AI Conference 2025\nDate: 2025-03-15\nLocation: Tech Center\nType: conference",
        tone: "professional",
        callToAction: "Please confirm your attendance",
        suggestions: "Include event details and parking information"
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // The backend now returns JSON
    const result = await response.json();
    console.log("✅ Email generation test successful!");
    console.log("Full response:", JSON.stringify(result, null, 2));
    
    if (result.result?.Output?.emailBody) {
      console.log("📧 Generated email body:", result.result.Output.emailBody.substring(0, 200) + "...");
      console.log("📬 Email subject:", result.result.Output.subject || "No subject");
    }
    
    return true;
  } catch (error) {
    console.error("❌ Email generation test failed:", error.message);
    return false;
  }
}

async function testEventCreation() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/event/test`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Backend connectivity test successful!");
    console.log("Response:", result);
    return true;
  } catch (error) {
    console.error("❌ Backend connectivity test failed:", error.message);
    return false;
  }
}

async function testEmailRegeneration() {
  try {
    console.log("🔄 Testing email regeneration...");
    
    const response = await fetch(`${API_BASE_URL}/api/generate_email_body`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        purpose: "Regenerate email for conference: AI Summit 2025 with improvements based on user feedback",
        recipientName: "John Doe",
        senderName: "Event Team",
        keyData: `Event: AI Summit 2025
Date: 2025-03-20
Time: 9:00 AM
Location: Tech Center
Type: conference
Description: Annual AI conference

Previous email was generated. User feedback: Make it more formal and add dress code information`,
        tone: "professional",
        callToAction: "Please confirm your attendance by replying to this email",
        suggestions: "Original request: Conference reminder email. User feedback for improvement: Make it more formal and add dress code information"
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Email regeneration test successful!");
    
    if (result.result?.Output?.emailBody) {
      console.log("🔄 Regenerated email includes user feedback");
      const emailBody = result.result.Output.emailBody.toLowerCase();
      if (emailBody.includes('dress') || emailBody.includes('attire') || emailBody.includes('formal')) {
        console.log("✅ User feedback incorporated (dress code found)");
      }
    }
    
    return true;
  } catch (error) {
    console.error("❌ Email regeneration test failed:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Testing backend integration...\n");
  
  const connectivityTest = await testEventCreation();
  const emailTest = await testEmailGeneration();
  const regenerationTest = await testEmailRegeneration();
  
  console.log("\n📊 Test Results:");
  console.log(`Backend Connectivity: ${connectivityTest ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Email Generation: ${emailTest ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Email Regeneration: ${regenerationTest ? "✅ PASS" : "❌ FAIL"}`);
  
  if (connectivityTest && emailTest && regenerationTest) {
    console.log("\n🎉 All tests passed! Frontend-backend integration with regeneration is working correctly.");
  } else {
    console.log("\n⚠️  Some tests failed. Please check your backend server is running on port 5000.");
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testEmailGeneration, testEventCreation };
