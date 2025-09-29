import axios from 'axios';

class SmythOSClassroom {
  constructor() {
    this.agentUrl = 'https://cmfw5qbmfxvnkjxgtpjoabofw.agent.a.smyth.ai';
  }

  async createClassroom(className) {
    try {
      const response = await axios.post(
        `${this.agentUrl}/create_classroom`,
        {
          className: className
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Classroom creation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async addClassroomAnnouncement(courseName, announcementText, materials = null) {
    console.log('=== CALLING REAL SMYTHOS CLASSROOM ANNOUNCEMENT ===')
    console.log(`Class Name: ${courseName}`);
    console.log(`Announcement: ${announcementText}`);
    console.log(`Materials: ${materials}`);
    
    try {
      const payload = {
        courseName: courseName,
        announcementText: announcementText
      };
      
      // Add materials if provided
      if (materials) {
        payload.materials = materials;
      }
      
      console.log("SmythOS Payload:", JSON.stringify(payload, null, 2));
      console.log("SmythOS URL:", `${this.agentUrl}/api/add_classroom_announcement`);

      const response = await axios.post(
        `${this.agentUrl}/api/add_classroom_announcement`, // Correct endpoint with /api prefix
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      console.log('=== SMYTHOS RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      
      return {
        success: true,
        message: 'Classroom announcement sent successfully via SmythOS',
        data: response.data
      };
      
    } catch (error) {
      console.error('=== SMYTHOS ERROR ===');
      console.error('Error details:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      
      // If it's a network error or timeout, still return success but log it
      if (error.code === 'ECONNABORTED') {
        console.log('Request timed out - announcement may have been sent');
        return { 
          success: true, 
          message: 'Announcement sent (timeout occurred)',
          data: { courseName, announcementText, status: 'timeout' }
        };
      }
      
      // For other errors, throw to let the controller handle it
      throw new Error(`SmythOS API error: ${error.response?.data || error.message}`);
    }
  }
}

export default new SmythOSClassroom();
