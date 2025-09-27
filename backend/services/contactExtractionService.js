import axios from 'axios';

const agentUrl = process.env.SMYTHOS_AGENT_URL || 'https://cmfw5qbmfxvnkjxgtpjoabofw.agent.a.smyth.ai';

export const extractAllContacts = async (sheetLink) => {
  try {
    const response = await axios.post(
      `${agentUrl}/api/extract_all_contacts`,
      {
        sheetLink: sheetLink
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Since the SmythOS API returns text/plain, we need to parse the response
    const responseData = response.data;
    try {
      // Try to parse as JSON in case the response is JSON formatted string
      return JSON.parse(responseData);
    } catch {
      // If not JSON, return the plain text response
      return responseData;
    }
  } catch (error) {
    console.error('Contact extraction failed:', error.response?.data || error.message);
    throw error;
  }
};