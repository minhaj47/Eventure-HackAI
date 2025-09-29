import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

async function testDatabaseIntegration() {
  console.log('🗄️  Testing Database Integration for Courses\n');
  
  try {
    // Test 1: Create a new course
    console.log('=== Test 1: Creating Blood Collection Course ===');
    const courseData = {
      className: "Blood Collection Fundamentals 2025",
      description: "Comprehensive training on blood collection techniques and safety protocols",
      instructor: "Dr. Sarah Johnson"
    };
    
    const createResponse = await axios.post(
      `${BASE_URL}/api/create`,
      courseData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    console.log('✅ Course Created:', createResponse.data.message);
    console.log('📊 Database ID:', createResponse.data.data.courseData._id);
    
    // Test 2: Add announcement to the course
    console.log('\n=== Test 2: Adding Announcement ===');
    const announcementData = {
      courseName: "Blood Collection Fundamentals 2025",
      announcementText: "Important: Lab session on venipuncture techniques scheduled for Monday. Please review Chapter 4 beforehand.",
      materials: "Lab manual Chapter 4, Safety equipment checklist"
    };
    
    const announcementResponse = await axios.post(
      `${BASE_URL}/api/add_classroom_announcement`,
      announcementData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    console.log('✅ Announcement Added:', announcementResponse.data.message);
    console.log('📢 Total Announcements:', announcementResponse.data.data.announcementCount);
    
    // Test 3: Get all courses
    console.log('\n=== Test 3: Retrieving All Courses ===');
    const coursesResponse = await axios.get(`${BASE_URL}/api/courses`);
    
    console.log('✅ Courses Retrieved:', coursesResponse.data.message);
    console.log('📚 Total Courses:', coursesResponse.data.count);
    console.log('📋 Course Names:');
    coursesResponse.data.data.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.courseName} (${course.announcements.length} announcements)`);
    });
    
    // Test 4: Get specific course by name
    console.log('\n=== Test 4: Getting Specific Course ===');
    const specificCourseResponse = await axios.get(
      `${BASE_URL}/api/courses/${encodeURIComponent("Blood Collection Fundamentals 2025")}`
    );
    
    console.log('✅ Specific Course Retrieved:', specificCourseResponse.data.message);
    const courseDetails = specificCourseResponse.data.data;
    console.log('📖 Course Details:');
    console.log(`   Name: ${courseDetails.courseName}`);
    console.log(`   Description: ${courseDetails.description}`);
    console.log(`   Instructor: ${courseDetails.instructor}`);
    console.log(`   Status: ${courseDetails.status}`);
    console.log(`   Created: ${new Date(courseDetails.createdAt).toLocaleDateString()}`);
    console.log(`   Announcements: ${courseDetails.announcements.length}`);
    
    // Test 5: Update course
    console.log('\n=== Test 5: Updating Course ===');
    const updateData = {
      description: "Advanced blood collection techniques with emphasis on patient safety and comfort",
      status: "active"
    };
    
    const updateResponse = await axios.put(
      `${BASE_URL}/api/courses/${encodeURIComponent("Blood Collection Fundamentals 2025")}`,
      updateData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('✅ Course Updated:', updateResponse.data.message);
    console.log('📝 New Description:', updateResponse.data.data.description);
    
  } catch (error) {
    console.error('❌ ERROR occurred:');
    
    if (error.response) {
      console.error('🚫 Status:', error.response.status);
      console.error('💥 Error:', error.response.data);
    } else {
      console.error('⚠️  Error:', error.message);
    }
  }
}

async function testMultipleCourses() {
  console.log('\n🏥 Testing Multiple Medical Courses\n');
  
  const courses = [
    {
      className: "Pediatric Phlebotomy Techniques",
      description: "Specialized blood collection for children",
      instructor: "Nurse Mary Wilson"
    },
    {
      className: "IV Therapy and Blood Draws",
      description: "Combined IV insertion and venipuncture training",
      instructor: "Dr. Michael Chen"
    },
    {
      className: "Emergency Blood Collection Protocols",
      description: "Rapid blood collection in emergency situations",
      instructor: "Paramedic John Smith"
    }
  ];
  
  for (let i = 0; i < courses.length; i++) {
    try {
      console.log(`Creating course ${i + 1}: ${courses[i].className}`);
      
      const response = await axios.post(
        `${BASE_URL}/api/create`,
        courses[i],
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      console.log(`✅ ${courses[i].className} created successfully`);
      
      // Add an announcement to each course
      await axios.post(
        `${BASE_URL}/api/add_classroom_announcement`,
        {
          courseName: courses[i].className,
          announcementText: `Welcome to ${courses[i].className}! Please review the syllabus before our first meeting.`,
          materials: "Course syllabus, safety guidelines"
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log(`📢 Welcome announcement added to ${courses[i].className}`);
      
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️  ${courses[i].className} already exists`);
      } else {
        console.error(`❌ Failed to create ${courses[i].className}:`, error.response?.data || error.message);
      }
    }
    
    // Wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Final summary
  try {
    const finalSummary = await axios.get(`${BASE_URL}/api/courses`);
    console.log(`\n📊 Final Summary: ${finalSummary.data.count} total courses in database`);
  } catch (error) {
    console.error('Failed to get final summary:', error.message);
  }
}

// Run all tests
async function runDatabaseTests() {
  console.log('🚀 Starting Database Integration Tests for Course Management\n');
  
  await testDatabaseIntegration();
  await testMultipleCourses();
  
  console.log('\n🎉 All database integration tests completed!');
}

runDatabaseTests().catch(console.error);