const API_BASE_URL = "https://cmfw5qbmfxvnkjxgtpjoabofw.agent.pa.smyth.ai";

export interface EventPostsRequest {
  eventName: string;
  dateTime: string;
  location: string;
  eventType: string;
  description?: string;
  googleFormLink?: string;
}

export interface EventPostsResponse {
  id: string;
  name: string;
  result: {
    Reply?: {
      twitterSmall?: string;
      twitterMedium?: string;
    };
    Output?: {
      whatsappSmall?: string;
      whatsappMedium?: string;
      facebookSmall?: string;
      facebookMedium?: string;
    };
  };
}

export interface EventPostersRequest {
  eventName: string;
  dateTime: string;
  location: string;
  eventType: string;
  description?: string;
  googleFormLink?: string;
}

export const generateEventPosts = async (
  data: EventPostsRequest
): Promise<EventPostsResponse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate_event_posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate event posts: ${response.statusText}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result : [result];
  } catch (error) {
    console.error("Error generating event posts:", error);
    throw error;
  }
};

export const generateEventPosters = async (eventData: EventPostersRequest) => {
  try {
    const response = await fetch('https://cmfz9614xai39jxgtk3ptj6u1.agent.pa.smyth.ai/api/generate_event_posters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify({
        eventName: eventData.eventName,
        dateTime: eventData.dateTime,
        location: eventData.location,
        eventType: eventData.eventType,
        description: eventData.description,
        googleFormLink: eventData.googleFormLink
      })
    });
    
    const result = await response.json();
    return result; // This will contain your 3 generated poster images
  } catch (error) {
    console.error('Error generating posters:', error);
    throw error;
  }
};
export const sendEventUpdate = async (data: {
  sheetId: string;
  eventName: string;
  eventMessage: string;
  sheetRange?: string;
}): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/send_event_update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send event update: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error sending event update:", error);
    throw error;
  }
};

export const createClassroom = async (data: {
  className: string;
  section?: string;
  description?: string;
  email?: string;
}): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/create_classroom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create classroom: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating classroom:", error);
    throw error;
  }
};
