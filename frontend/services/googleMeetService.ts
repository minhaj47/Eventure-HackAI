/**
 * Google Meet API Service
 * Handles communication with the Google Meet backend endpoints
 */

export interface GoogleMeetRequest {
  meetingTitle: string;
  startDateTime: string;
  endDateTime: string;
  editorEmail?: string;
  description?: string;
}

export interface GoogleMeetResponse {
  success: boolean;
  meetingTitle: string;
  meetingUrl: string;
  meetingId: string;
  startDateTime: string;
  endDateTime: string;
  calendarEventId: string;
  instructions: string;
}

export interface GoogleMeetConfigResponse {
  success: boolean;
  configuration: {
    isValid: boolean;
    issues: string[];
    configuration: {
      endpoint: string;
      requiresApiKey: boolean;
    };
  };
}

class GoogleMeetService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://iman-production.up.railway.app';
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  /**
   * Create a new Google Meet meeting
   */
  async createMeeting(meetingData: GoogleMeetRequest): Promise<GoogleMeetResponse> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to create Google Meet meetings.');
    }

    const response = await fetch(`${this.baseUrl}/api/event/create-google-meet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: GoogleMeetResponse = await response.json();
    return result;
  }

  /**
   * Check Google Meet service configuration
   */
  async checkConfiguration(): Promise<GoogleMeetConfigResponse> {
    const response = await fetch(`${this.baseUrl}/api/event/google-meet-config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check configuration: ${response.statusText}`);
    }

    const result: GoogleMeetConfigResponse = await response.json();
    return result;
  }

  /**
   * Validate meeting data before sending to API
   */
  validateMeetingData(meetingData: GoogleMeetRequest): string | null {
    if (!meetingData.meetingTitle?.trim()) {
      return 'Meeting title is required';
    }

    if (!meetingData.startDateTime) {
      return 'Start date and time is required';
    }

    if (!meetingData.endDateTime) {
      return 'End date and time is required';
    }

    const startDate = new Date(meetingData.startDateTime);
    const endDate = new Date(meetingData.endDateTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Invalid date format';
    }

    if (endDate <= startDate) {
      return 'End time must be after start time';
    }

    if (startDate < new Date()) {
      return 'Start time cannot be in the past';
    }

    if (meetingData.editorEmail && !this.isValidEmail(meetingData.editorEmail)) {
      return 'Please enter a valid email address';
    }

    return null;
  }

  /**
   * Basic email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format date for display
   */
  formatDateTime(isoString: string): string {
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}

// Export singleton instance
export const googleMeetService = new GoogleMeetService();
export default googleMeetService;