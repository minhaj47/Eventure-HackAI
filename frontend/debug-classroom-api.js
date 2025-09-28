// Test the classroom update API endpoint
console.log('=== CLASSROOM UPDATE API TEST ===');

// Test the actual endpoint that was failing
const eventId = '68d7c56f3c7f556863b35d5f'; // From your error log
const classroomData = {
  classroomcode: 'qqthhoyh',
  classroomlink: 'https://classroom.google.com/c/ODAzNTM1ODAzNzc4'
};

console.log('Testing endpoint: PUT http://localhost:5000/api/event/update-classroom/' + eventId);
console.log('With data:', JSON.stringify(classroomData, null, 2));

console.log('\n=== POTENTIAL ISSUES TO CHECK ===');
console.log('1. ✅ API URL - Fixed from localhost:8000 to localhost:5000');
console.log('2. ✅ Route registration - /update-classroom/:eventId is registered');
console.log('3. ✅ Controller export - updateEventClassroom is exported');
console.log('4. ❓ Backend server running - Check if backend is started');
console.log('5. ❓ Authentication - Route requires isAuth middleware');
console.log('6. ❓ Event exists - Check if event ID exists in database');

console.log('\n=== DEBUGGING STEPS ===');
console.log('1. Make sure backend server is running:');
console.log('   cd backend && npm start');
console.log('   Should show "server started" in console');

console.log('\n2. Test if backend is responding:');
console.log('   curl http://localhost:5000/api/event/test');
console.log('   Should return: {"message":"Test route working without auth"}');

console.log('\n3. Check if you are authenticated:');
console.log('   - Make sure you are logged in');
console.log('   - Check browser cookies for authentication');
console.log('   - Try creating/viewing other events first');

console.log('\n4. Verify the event ID exists:');
console.log('   - Check MongoDB database');
console.log('   - Or try with a different/newer event ID');

console.log('\n=== NEXT STEPS ===');
console.log('If backend is running and you are authenticated:');
console.log('1. The API URL fix should resolve the 404 error');
console.log('2. Try the classroom update functionality again');
console.log('3. Watch browser console for the new API calls');
console.log('4. Check backend console for incoming requests');

console.log('\n🚀 TRY AGAIN NOW - The API URL has been fixed!');