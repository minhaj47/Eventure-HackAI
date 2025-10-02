const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://iman-production.up.railway.app";

export interface Contact {
  name: string;
  email: string;
}

interface RawContact {
  name?: string;
  Name?: string;
  email?: string;
  Email?: string;
  mail?: string;
}

export interface ContactExtractionResponse {
  id: string;
  name: string;
  result: {
    Output: {
      contacts: {
        contacts: Contact[];
      };
    };
  };
}

export const extractContacts = async (sheetLink: string): Promise<ContactExtractionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/extract-contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sheetLink })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to extract contacts: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Extracted contacts data:', data);
    return data.data;
  } catch (error) {
    console.error('Error extracting contacts:', error);
    throw error;
  }
};

// Extract all contacts from Google Sheet for participants
export const extractAllContactsFromSheet = async (sheetLink: string): Promise<Contact[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/extract_all_contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sheetLink })
    });
    console.log('Response from extract_all_contacts:', response);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to extract contacts: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Extracted all contacts data:', data);
    console.log('this is the backend data format');
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to extract contacts');
    }

    // Handle the specific backend response format: data.result.Output.contacts.contacts
    let contacts: Contact[] = [];
    
    if (data.data && data.data.result && data.data.result.Output && 
        data.data.result.Output.contacts && Array.isArray(data.data.result.Output.contacts.contacts)) {
      // This matches the actual backend format
      contacts = data.data.result.Output.contacts.contacts;
    } else if (typeof data.data === 'string') {
      // If the response is a string, try to parse it as JSON
      try {
        const parsedData = JSON.parse(data.data);
        if (parsedData.result && parsedData.result.Output && 
            parsedData.result.Output.contacts && Array.isArray(parsedData.result.Output.contacts.contacts)) {
          contacts = parsedData.result.Output.contacts.contacts;
        } else if (parsedData.contacts && Array.isArray(parsedData.contacts)) {
          contacts = parsedData.contacts;
        } else if (Array.isArray(parsedData)) {
          contacts = parsedData;
        }
      } catch {
        console.warn('Could not parse contacts from text response');
      }
    } else if (data.data && typeof data.data === 'object') {
      // Handle other object response formats
      if (data.data.contacts && Array.isArray(data.data.contacts)) {
        contacts = data.data.contacts;
      } else if (Array.isArray(data.data)) {
        contacts = data.data;
      }
    }

    // Ensure contacts have the required structure
    return contacts.map((contact: RawContact) => ({
      name: contact.name || contact.Name || 'Unknown',
      email: contact.email || contact.Email || contact.mail || ''
    }));

  } catch (error) {
    console.error('Error extracting all contacts:', error);
    throw error;
  }
};

export interface EmailGenerationRequest {
  purpose: string;
  recipientName?: string;
  senderName?: string;
  keyData: string;
  tone?: string;
  callToAction?: string;
  suggestions?: string;
}

export interface ParsedEmail {
  subject: string;
  body: string;
}

export interface SendEmailToParticipantsRequest {
  sheetLink: string;
  emailSubject: string;
  emailBody: string;
}

export interface SendSingleEmailRequest {
  recipientEmail: string;
  subject: string;
  body: string;
}

export const generateEmailBody = async (
  data: EmailGenerationRequest
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate_email_body`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to generate email: ${response.statusText}`
      );
    }

    // Try to parse as JSON first (SmythOS API format)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const jsonResponse = await response.json();
      console.log("API Response:", jsonResponse); // Debug logging

      // Handle SmythOS API response format
      if (jsonResponse.result?.Output?.emailBody) {
        const subject = jsonResponse.result.Output.subject || "";
        let body = jsonResponse.result.Output.emailBody || "";

        // Replace template variables with placeholders or actual values
        body = body.replace(/\{\{recipientName\}\}/g, "[Recipient Name]");
        body = body.replace(
          /\{\{senderName\}\}/g,
          data.senderName || "[Sender Name]"
        );

        // Combine subject and body for a complete email
        return subject ? `Subject: ${subject}\n\n${body}` : body;
      }

      // Fallback for other JSON formats
      if (typeof jsonResponse === "string") {
        return jsonResponse;
      }

      // Try to find email content in other possible locations
      if (jsonResponse.emailBody) {
        return jsonResponse.emailBody;
      }

      if (jsonResponse.data?.emailBody) {
        return jsonResponse.data.emailBody;
      }

      // If it's an object, try to extract meaningful content
      console.warn("Unexpected API response format:", jsonResponse);
      return `API Response (unexpected format):\n${JSON.stringify(
        jsonResponse,
        null,
        2
      )}`;
    } else {
      // Fallback to plain text
      const emailContent = await response.text();
      return emailContent;
    }
  } catch (error) {
    console.error("Error generating email:", error);

    // Add more context for debugging
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to backend at ${API_BASE_URL}. Please ensure the backend server is running.`
      );
    }

    throw error;
  }
};

// Parse email content to extract subject and body
export const parseEmailContent = (emailContent: string): ParsedEmail => {
  const lines = emailContent.split('\n');
  let subject = '';
  let body = '';
  let bodyStartIndex = 0;

  // Look for subject line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().startsWith('subject:')) {
      subject = lines[i].substring(8).trim(); // Remove 'Subject:' prefix
      bodyStartIndex = i + 1;
      break;
    }
  }

  // Extract body (skip empty lines after subject)
  while (bodyStartIndex < lines.length && lines[bodyStartIndex].trim() === '') {
    bodyStartIndex++;
  }
  body = lines.slice(bodyStartIndex).join('\n').trim();

  // If no subject found, use first line as subject or default
  if (!subject && lines.length > 0) {
    subject = lines[0].trim() || 'Event Notification';
    body = lines.slice(1).join('\n').trim();
  }

  // Fallback if still no subject
  if (!subject) {
    subject = 'Event Notification';
  }

  return { subject, body: body || emailContent };
};

// Send emails to all participants via Google Sheet
export const sendEmailToAllParticipants = async (data: SendEmailToParticipantsRequest): Promise<{success: boolean; message: string; data?: unknown}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/event/send-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to send emails: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending emails to participants:', error);
    throw error;
  }
};

// Send a single email to a specific recipient
export const sendSingleEmail = async (data: SendSingleEmailRequest): Promise<{success: boolean; message: string; data?: unknown}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/send_single_email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to send email: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending single email:', error);
    throw error;
  }
};

// Update classroom data for an event
export interface UpdateClassroomRequest {
  className?:string;
  classroomcode?: string;
  classroomlink?: string;

}

export interface UpdateClassroomResponse {
  success: boolean;
  message: string;
  event?: {
    _id: string;
    eventName: string;
    classroomcode?: string;
    classroomlink?: string;
    updatedAt: string;
  };
}

export const updateEventClassroom = async (eventId: string, data: UpdateClassroomRequest): Promise<UpdateClassroomResponse> => {
  try {
    console.log('=== updateEventClassroom API CALL ===');
    console.log('Event ID:', eventId);
    console.log('Classroom data:', data);

    const response = await fetch(`${API_BASE_URL}/api/event/update-classroom/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    
      body: JSON.stringify(data)
    });

    console.log('=== API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('OK:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.message || `Failed to update classroom: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('=== API SUCCESS RESULT ===');
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error updating classroom:', error);
    throw error;
  }
};

// Send announcement to classroom
export interface ClassroomAnnouncementRequest {
  className: string; // Frontend uses className which becomes courseName in backend
  announcementText: string;
  materials?: string[];
}

export interface ClassroomAnnouncementResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export const sendClassroomAnnouncement = async (data: ClassroomAnnouncementRequest): Promise<ClassroomAnnouncementResponse> => {
  try {
    console.log('=== sendClassroomAnnouncement API CALL ===');
    console.log('Announcement data:', data);

    // Map className to courseName for backend compatibility
    const backendPayload = {
      courseName: data.className,
      announcementText: data.announcementText,
      materials: data.materials
    };

    console.log('Backend payload:', backendPayload);

    const response = await fetch(`${API_BASE_URL}/api/add_classroom_announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload)
    });

    console.log('=== CLASSROOM ANNOUNCEMENT API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('OK:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || errorData.message || `Failed to send announcement: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('=== ANNOUNCEMENT API SUCCESS RESULT ===');
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error sending classroom announcement:', error);
    throw error;
  }
};

// AI-powered announcement generation
export interface AnnouncementGenerationRequest {
  announcementMessage: string;
  eventName: string;
  eventType: string;
  suggestions?: string;
}

export const generateEventAnnouncement = async (data: AnnouncementGenerationRequest): Promise<string> => {
  try {
    console.log('=== generateEventAnnouncement API CALL ===');
    console.log('Announcement generation data:', data);

    const response = await fetch(`${API_BASE_URL}/api/event/generate-announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    console.log('=== ANNOUNCEMENT GENERATION API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('OK:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || errorData.message || `Failed to generate announcement: ${response.statusText}`);
    }

    // The response is text, not JSON
    const result = await response.text();
    console.log('=== ANNOUNCEMENT GENERATION SUCCESS RESULT ===');
    console.log('Generated announcement:', result);
    return result;
  } catch (error) {
    console.error('Error generating event announcement:', error);
    throw error;
  }
};
