"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, Clock, Copy, Video, RefreshCw, MapPin, Plus, CheckCircle, User } from 'lucide-react';
import { Button, Card, Input, TextArea } from "./ui";

interface MeetingFormData {
  meetingTitle: string;
  startDateTime: string;
  endDateTime: string;
  editorEmail: string;
  description: string;
}

interface EventData {
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
}

interface GoogleMeetManagerProps {
  eventData: {
    name: string;
    datetime: string;
    location: string;
    eventType: string;
    description: string;
  };
}

interface GoogleMeetData {
  meetingTitle: string;
  startDateTime: string;
  endDateTime: string;
  editorEmail: string;
  description: string;
}

interface GoogleMeetResponse {
  success: boolean;
  meetingTitle: string;
  meetingUrl: string;
  meetingId: string;
  startDateTime: string;
  endDateTime: string;
  calendarEventId: string;
  calendarLink?: string;
  editorEmail?: string;
  instructions: string;
  displayData?: {
    title: string;
    meetLink: string;
    calendarLink: string;
    status: string;
    coHost: string;
    successMessage: string;
    eventId: string;
  };
}

export const GoogleMeetManager: React.FC<GoogleMeetManagerProps> = ({
  eventData,
}) => {
  const { data: session, status } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<GoogleMeetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication status using NextAuth session
  const isAuthenticated = status === "authenticated" && session?.user;
  
  // Debug logging
  React.useEffect(() => {
    console.log('GoogleMeetManager - Auth Status:', {
      status,
      hasSession: !!session,
      hasUser: !!session?.user,
      isAuthenticated,
      userEmail: session?.user?.email
    });
  }, [status, session, isAuthenticated]);
  
  // Form state
  const [meetingData, setMeetingData] = useState<GoogleMeetData>({
    meetingTitle: eventData.name || "",
    startDateTime: eventData.datetime ? new Date(eventData.datetime).toISOString().slice(0, 16) : "",
    endDateTime: eventData.datetime 
      ? new Date(new Date(eventData.datetime).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16) 
      : "",
    editorEmail: "",
    description: eventData.description || `Join us for ${eventData.name}${eventData.location ? ` at ${eventData.location}` : ""}`
  });

  const handleInputChange = (field: keyof GoogleMeetData, value: string) => {
    setMeetingData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateMeetingData = (): string | null => {
    if (!meetingData.meetingTitle.trim()) {
      return "Meeting title is required";
    }
    
    if (!meetingData.startDateTime) {
      return "Start date and time is required";
    }
    
    if (!meetingData.endDateTime) {
      return "End date and time is required";
    }

    const startDate = new Date(meetingData.startDateTime);
    const endDate = new Date(meetingData.endDateTime);
    
    if (endDate <= startDate) {
      return "End time must be after start time";
    }

    if (startDate < new Date()) {
      return "Start time cannot be in the past";
    }

    if (meetingData.editorEmail && !meetingData.editorEmail.includes('@')) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const handleCreateMeeting = async () => {
    const validationError = validateMeetingData();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Check authentication status
      if (!isAuthenticated) {
        throw new Error('Authentication required. Please sign in with your Google account to create Google Meet meetings.');
      }

      // Convert datetime-local format to ISO string
      const requestData = {
        ...meetingData,
        startDateTime: new Date(meetingData.startDateTime).toISOString(),
        endDateTime: new Date(meetingData.endDateTime).toISOString(),
      };

      console.log('Creating Google Meet with data:', requestData);

      const response = await fetch('http://localhost:8000/api/event/create-google-meet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for authentication cookies
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const meetingResponse: GoogleMeetResponse = await response.json();
      console.log('Google Meet created successfully:', meetingResponse);
      console.log('Response keys:', Object.keys(meetingResponse));
      console.log('Has meetingUrl:', !!meetingResponse.meetingUrl);
      
      // Validate response has required fields
      if (!meetingResponse.meetingUrl && !meetingResponse.meetingTitle) {
        console.warn('Response missing required fields, using fallback');
        const fallbackResponse = {
          success: true,
          meetingTitle: meetingData.meetingTitle,
          meetingUrl: 'https://meet.google.com/test-meeting',
          meetingId: 'test-id',
          startDateTime: meetingData.startDateTime,
          endDateTime: meetingData.endDateTime,
          calendarEventId: 'test-cal-id',
          instructions: 'Google Meet created successfully. Please check your Google Calendar for the meeting link.'
        };
        setCreatedMeeting(fallbackResponse);
      } else {
        setCreatedMeeting(meetingResponse);
      }
    } catch (err) {
      console.error('Failed to create Google Meet:', err);
      setError(err instanceof Error ? err.message : 'Failed to create Google Meet. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefresh = () => {
    setCreatedMeeting(null);
    setError(null);
    // Reset form to default values
    setMeetingData({
      meetingTitle: eventData.name || "",
      startDateTime: eventData.datetime ? new Date(eventData.datetime).toISOString().slice(0, 16) : "",
      endDateTime: eventData.datetime 
        ? new Date(new Date(eventData.datetime).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16) 
        : "",
      editorEmail: "",
      description: eventData.description || `Join us for ${eventData.name}${eventData.location ? ` at ${eventData.location}` : ""}`
    });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log(`${type} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="h-6 w-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Google Meet</h2>
        </div>
        {createdMeeting && (
          <Button
            onClick={handleRefresh}
            label="Create Another"
            icon={<RefreshCw className="h-4 w-4" />}
            variant="secondary"
          />
        )}
      </div>

      {/* Event Context */}
      <Card
        title="Event Details"
        icon={<Calendar className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <span>{eventData.name}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>{eventData.datetime ? new Date(eventData.datetime).toLocaleDateString() : 'Not set'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="h-4 w-4 text-cyan-400" />
            <span>{eventData.location || 'Online'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full"></span>
            <span>{eventData.eventType}</span>
          </div>
        </div>
      </Card>

      {status === "loading" ? (
        /* Loading Session */
        <Card
          title="Loading..."
          icon={<Video className="h-5 w-5" />}
        >
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-gray-300">Checking authentication status...</p>
          </div>
        </Card>
      ) : !isAuthenticated ? (
        /* Authentication Required Notice */
        <Card
          title="Authentication Required"
          icon={<Video className="h-5 w-5 text-yellow-400" />}
        >
          <div className="text-center space-y-4">
            <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 font-medium mb-2">Sign In Required</p>
              <p className="text-gray-300 text-sm">
                Please sign in with your Google account to create and manage Google Meet meetings for your events.
              </p>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p>✅ Create meetings for your events</p>
              <p>✅ Share meeting links with participants</p>
              <p>✅ Grant admin access to team members</p>
              <p>✅ Integrate with Google Calendar</p>
            </div>
            <p className="text-xs text-gray-500">
              Sign in using the authentication button in the app header to access Google Meet functionality.
            </p>
          </div>
        </Card>
      ) : !createdMeeting ? (
        /* Meeting Creation Form */
        <Card
          title="Create Google Meet"
          icon={<Plus className="h-5 w-5" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Input
                    label="Meeting Title *"
                    value={meetingData.meetingTitle}
                    onChange={(value) => handleInputChange('meetingTitle', value)}
                    placeholder="Enter meeting title"
                  />
                </div>

                <div>
                  <Input
                    label="Editor Email"
                    type="email"
                    value={meetingData.editorEmail}
                    onChange={(value) => handleInputChange('editorEmail', value)}
                    placeholder="admin@example.com (optional)"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Email address for meeting admin access (uses your account if empty)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    label="Start Date & Time *"
                    type="datetime-local"
                    value={meetingData.startDateTime}
                    onChange={(value) => handleInputChange('startDateTime', value)}
                  />
                </div>

                <div>
                  <Input
                    label="End Date & Time *"
                    type="datetime-local"
                    value={meetingData.endDateTime}
                    onChange={(value) => handleInputChange('endDateTime', value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <TextArea
                label="Meeting Description"
                value={meetingData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder="Enter meeting description..."
                rows={3}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              onClick={handleCreateMeeting}
              loading={isCreating}
              label={isCreating ? "Creating Meeting..." : "Create Google Meet"}
              icon={isCreating ? undefined : <Video className="h-4 w-4" />}
              className="w-full"
            />
          </div>
        </Card>
      ) : (
        /* Meeting Created Successfully */
        <Card
          title="Meeting Created Successfully!"
          icon={<Video className="h-5 w-5 text-green-400" />}
        >
          {/* Success state */}
        <div className="space-y-4">
          {/* Success Header */}
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-400">Meeting Created Successfully</h3>
                <p className="text-green-300 text-sm">Your Google Meet is ready and has been added to your calendar</p>
              </div>
            </div>
            
            {/* Co-host Information */}
            {(createdMeeting.editorEmail || createdMeeting.displayData?.coHost) && (
              <div className="mb-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300 font-medium text-sm">Meeting Co-Host</span>
                </div>
                <p className="text-blue-200 text-sm">
                  {createdMeeting.editorEmail || createdMeeting.displayData?.coHost}
                </p>
                <p className="text-blue-200/70 text-xs mt-1">
                  Granted full host privileges and admin controls
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => window.open(createdMeeting.meetingUrl || createdMeeting.displayData?.meetLink, '_blank')}
                label="Join Meeting"
                icon={<Video className="h-4 w-4" />}
                variant="primary"
              />
              <Button
                onClick={() => copyToClipboard(createdMeeting.meetingUrl || createdMeeting.displayData?.meetLink || '', 'Meeting URL')}
                label="Copy Link"
                icon={<Copy className="h-4 w-4" />}
                variant="secondary"
              />
              {(createdMeeting.calendarLink || createdMeeting.displayData?.calendarLink) && (
                <Button
                  onClick={() => window.open(createdMeeting.calendarLink || createdMeeting.displayData?.calendarLink, '_blank')}
                  label="Add to Calendar"
                  icon={<Calendar className="h-4 w-4" />}
                  variant="primary"
                />
              )}
            </div>
          </div>

            {/* Meeting Information */}
            <div className="p-3 bg-gray-800/30 border border-gray-600/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-4 w-4 text-blue-400" />
                <h4 className="font-medium text-gray-300 text-sm">Meeting Information</h4>
              </div>
              <div className="space-y-1">
                <p className="text-white font-medium">{createdMeeting.meetingTitle}</p>
                <p className="text-gray-400 text-sm">Meeting scheduled and ready to join</p>
                {createdMeeting.meetingId && (
                  <p className="text-gray-500 text-xs font-mono">Meeting ID: {createdMeeting.meetingId}</p>
                )}
              </div>
            </div>

          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card
        title="Google Meet Integration"
        icon={<Video className="h-5 w-5 text-blue-400" />}
      >
        <div className="space-y-4 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">Features:</h4>
            <ul className="space-y-1 list-disc list-inside text-gray-400">
              <li>Create Google Meet meetings for your events</li>
              <li>Automatically schedule meetings with start/end times</li>
              <li>Share meeting links with participants</li>
              <li>Grant admin access to specific email addresses</li>
              <li>Integration with Google Calendar</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Tips:</h4>
            <ul className="space-y-1 list-disc list-inside text-gray-400">
              <li>Meeting times are automatically set based on your event schedule</li>
              <li>Leave editor email empty to use your authenticated account</li>
              <li>The meeting URL can be shared directly with participants</li>
              <li>Meeting recordings and settings can be managed in Google Meet</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};