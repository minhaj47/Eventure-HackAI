import { useCallback, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        // Create a timeout promise to prevent hanging (increased to 6 minutes total)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout - form creation is taking longer than expected')), 360000); // 6 minutes
        });

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

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    createEvent,
    setError, // Allow manual error clearing
  };
};
