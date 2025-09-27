const axios = require('axios');

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
}

module.exports = new SmythOSClassroom();
