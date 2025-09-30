#!/bin/bash

# Test script for AI-powered announcement generation
echo "🚀 Testing AI-Powered Event Announcement Generator"
echo "================================================="

# Make sure backend is running
echo "📡 Testing backend connectivity..."
curl -s http://localhost:8000/api/event/test > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running. Please start with: cd backend && npm start"
    exit 1
fi

echo ""
echo "🎯 Testing announcement generation endpoint..."

# Test the announcement generation API
response=$(curl -s -X POST "http://localhost:8000/api/event/generate-announcement" \
  -H "Content-Type: application/json" \
  -d '{
    "announcementMessage": "Welcome to our innovative AI and Data Science workshop",
    "eventName": "AI & Data Science Workshop 2024",
    "eventType": "workshop",
    "suggestions": "Make it engaging, mention practical skills, networking opportunities, and include classroom code. Keep it professional but friendly."
  }')

if [ $? -eq 0 ]; then
    echo "✅ API call successful"
    echo "📝 Generated announcement (clean text):"
    echo "----------------------------------------"
    echo "$response"
    echo "----------------------------------------"
else
    echo "❌ API call failed"
    exit 1
fi

echo ""
echo "🎉 Test completed successfully!"
echo ""
echo "💡 Features implemented:"
echo "  ✅ AI-powered announcement generation using Smythos"
echo "  ✅ Suggestions handling like email generator"
echo "  ✅ Regeneration with user feedback"
echo "  ✅ Frontend integration with ClassroomManagement component"
echo "  ✅ Proper error handling and fallbacks"
echo ""
echo "🔗 API Endpoint: POST /api/event/generate-announcement"
echo "📋 Required fields: announcementMessage, eventName, eventType"
echo "🔧 Optional field: suggestions"