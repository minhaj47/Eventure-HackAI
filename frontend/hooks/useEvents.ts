import { useCallback, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BackendEvent {
  _id: string;
  eventName: string;
  dateTime: string;
  location: string;
  eventType: string;
  description?: string;
  registrationFormUrl?: string;
  registrationFormEditUrl?: string;
  autoCreateForm?: boolean;
  className?: string;
  classroomcode?: string;
  classroomlink?: string;
  createdAt: string;
  updatedAt: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/event/all`, {
        method: "GET",
        credentials: "include", // Important for authentication cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to view your events");
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data.events || []);

      return data.events;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch events";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEvent = useCallback(
    async (eventData: {
      eventName: string;
      dateTime: string;
      location: string;
      eventType: string;
      description?: string;
      autoCreateForm?: boolean;
      className?: string;
      classroomcode?: string;
      classroomlink?: string;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('=== useEvents createEvent CALLED ===');
        console.log('Event data received in useEvents:', JSON.stringify(eventData, null, 2));
        console.log('=== CLASSROOM DATA IN useEvents ===');
        console.log('classroomcode:', eventData.classroomcode);
        console.log('classroomlink:', eventData.classroomlink);
        console.log('API_BASE_URL:', API_BASE_URL);
        
        // Create a timeout promise to prevent hanging (increased to 6 minutes total)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout - form creation is taking longer than expected')), 360000); // 6 minutes
        });

        console.log('=== SENDING API REQUEST ===');
        console.log('Request body:', JSON.stringify(eventData));
        
        const fetchPromise = fetch(`${API_BASE_URL}/api/event/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(eventData),
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please sign in to create events");
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create event");
        }

        const data = await response.json();

        console.log('=== CREATE EVENT RESPONSE ===');
        console.log('Response data:', data);
        console.log('Event data:', data.event);
        console.log('Form generation:', data.formGeneration);
        console.log('=== CLASSROOM DATA IN RESPONSE ===');
        console.log('Response classroomcode:', data.event?.classroomcode);
        console.log('Response classroomlink:', data.event?.classroomlink);

        if (!data.event) {
          throw new Error('No event data in response');
        }

        // Add the new event to the local state
        setEvents((prev) => [data.event, ...prev]);

        return data.event;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create event";
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('=== useEvents deleteEvent CALLED ===');
        console.log('Event ID to delete:', eventId);
        console.log('API_BASE_URL:', API_BASE_URL);

        const response = await fetch(`${API_BASE_URL}/api/event/delete/${eventId}`, {
          method: "DELETE",
          credentials: "include", // Important for authentication cookies
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please sign in to delete events");
          }
          if (response.status === 404) {
            throw new Error("Event not found");
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete event");
        }

        const data = await response.json();
        console.log('=== DELETE EVENT RESPONSE ===');
        console.log('Response data:', data);

        // Remove the deleted event from the local state
        setEvents((prev) => prev.filter(event => event._id !== eventId));

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete event";
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    createEvent,
    deleteEvent,
    setError, // Allow manual error clearing
  };
};
