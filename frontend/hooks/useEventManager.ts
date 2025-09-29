import { useState } from "react";
import { Banner, BannerConfig, EventData, RegistrationField } from "../types";
import { useEvents, BackendEvent } from "./useEvents";

export const useEventManager = (onEventCreated?: (event?: BackendEvent) => void) => {
  const { createEvent, deleteEvent } = useEvents();

  const [eventData, setEventData] = useState<EventData>({
    eventName: "",
    dateTime: "",
    location: "",
    description: "",
    eventType: "conference",
    autoCreateForm: false,
  });

  const [showAIOutput, setShowAIOutput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBanners, setGeneratedBanners] = useState<Banner[]>([]);
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);

  const [registrationFields, setRegistrationFields] = useState<
    RegistrationField[]
  >([
    { id: 1, name: "Full Name", type: "text", required: true },
    { id: 2, name: "Email Address", type: "email", required: true },
    { id: 3, name: "WhatsApp Number", type: "tel", required: false },
    { id: 4, name: "Organization", type: "text", required: false },
  ]);
  const [newFieldName, setNewFieldName] = useState("");

  const handleEventSubmit = async () => {
    if (!eventData.eventName || !eventData.dateTime || !eventData.location)
      return;

    setIsGenerating(true);

    try {
      console.log('=== STARTING EVENT CREATION ===');
      console.log('Event data to create:', eventData);

      
      const apiPayload = {
        eventName: eventData.eventName,
        dateTime: eventData.dateTime,
        location: eventData.location,
        eventType: eventData.eventType,
        description: eventData.description,
        autoCreateForm: eventData.autoCreateForm ?? false, // Default to false
      };      console.log('=== API PAYLOAD ===');
      console.log('Full payload being sent to API:', JSON.stringify(apiPayload, null, 2));
      
      // Create the actual event with automatic form generation
      const newEvent = await createEvent(apiPayload);

      console.log('=== EVENT CREATION SUCCESS ===');
      console.log('Created event:', newEvent);
      console.log('Has form URLs:', {
        registrationFormUrl: newEvent?.registrationFormUrl,
        registrationFormEditUrl: newEvent?.registrationFormEditUrl
      });

      // The createEvent function already updates the local state with the new event
      // No need to fetchEvents() again as it might cause authentication issues
      
      console.log('=== SHOWING AI OUTPUT AND CALLING CALLBACK ===');
      // Show AI output and call success callback with the created event
      setShowAIOutput(true);
      onEventCreated?.(newEvent); // Pass the created event to the callback
      
      console.log('=== EVENT CREATION FLOW COMPLETED ===');
    } catch (error) {
      console.error("=== EVENT CREATION FAILED ===");
      console.error("Error details:", error);
      
      // Determine error type and show appropriate message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('network') || errorMessage.includes('ECONNRESET')) {
        console.log('Network error detected - form creation may have failed');
        // Still call the callback with a partial event if possible
        onEventCreated?.();
      } else {
        console.log('Other error type:', errorMessage);
      }
      
      // Show AI output even if event creation fails so user can still continue
      setShowAIOutput(true);
      
      // Also call the success callback to prevent the page from being stuck
      onEventCreated?.();
    } finally {
      console.log('=== SETTING isGenerating TO FALSE ===');
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field: keyof EventData, value: string) => {
    console.log('=== handleInputChange CALLED ===');
    console.log('Field:', field);
    console.log('Value:', value);
    
    setEventData((prev) => {
      const newData = { ...prev, [field]: value };
      console.log('=== UPDATED EVENT DATA ===');
      console.log('New eventData:', newData);
      return newData;
    });
  };

  const resetForm = () => {
    setEventData({
      eventName: "",
      dateTime: "",
      location: "",
      description: "",
      eventType: "conference",
      autoCreateForm: false,
    });
    setShowAIOutput(false);
  };

  const generateBanners = (config?: BannerConfig) => {
    setIsGeneratingBanner(true);
    setTimeout(() => {
      const banners: Banner[] = [
        {
          id: 1,
          style: `${config?.style || "Modern"} ${
            eventData.eventType || "Event"
          } Banner`,
          preview: "banner-1",
          description: `${config?.colorScheme || "Corporate"} themed ${
            config?.layout || "centered"
          } layout with ${config?.imagery || "icons"} (${
            config?.size || "medium"
          } ${config?.type || "social"})`,
          // Legacy properties
          size: config?.size,
          type: config?.type,
          // Enhanced properties
          purpose: eventData.eventType,
          styleType: config?.style,
          colorScheme: config?.colorScheme,
          layout: config?.layout,
          imagery: config?.imagery,
        },
        {
          id: 2,
          style: `${config?.style || "Professional"} ${
            eventData.eventType || "Event"
          } Design`,
          preview: "banner-2",
          description: `${config?.style || "Modern"} design featuring ${
            config?.imagery || "graphics"
          } in ${config?.colorScheme || "brand"} colors (${
            config?.size || "medium"
          } size)`,
          // Legacy properties
          size: config?.size,
          type: config?.type,
          // Enhanced properties
          purpose: eventData.eventType,
          styleType: config?.style,
          colorScheme: config?.colorScheme,
          layout: config?.layout,
          imagery: config?.imagery,
        },
        {
          id: 3,
          style: `${config?.style || "Creative"} ${
            eventData.eventType || "Event"
          } Poster`,
          preview: "banner-3",
          description: `${config?.layout || "Centered"} composition with ${
            config?.imagery || "artistic"
          } elements in ${config?.colorScheme || "vibrant"} palette (${
            config?.type || "print"
          } ready)`,
          // Legacy properties
          size: config?.size,
          type: config?.type,
          // Enhanced properties
          purpose: eventData.eventType,
          styleType: config?.style,
          colorScheme: config?.colorScheme,
          layout: config?.layout,
          imagery: config?.imagery,
        },
      ];
      setGeneratedBanners(banners);
      setIsGeneratingBanner(false);
    }, 3000);
  };

  const refreshBanner = (bannerId: number, config?: BannerConfig) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setGeneratedBanners((prev) =>
          prev.map((banner) =>
            banner.id === bannerId
              ? {
                  ...banner,
                  style: `Refreshed ${config?.style || "Modern"} ${
                    eventData.eventType || "Event"
                  } ${banner.style.split(" ").slice(-1)[0]}`,
                  description: `Updated ${
                    config?.style || "modern"
                  } design with ${config?.imagery || "enhanced graphics"} in ${
                    config?.colorScheme || "fresh"
                  } colors (${config?.size || "refreshed"} ${
                    config?.type || "format"
                  })`,
                  // Legacy properties
                  size: config?.size,
                  type: config?.type,
                  // Enhanced properties
                  purpose: eventData.eventType,
                  styleType: config?.style,
                  colorScheme: config?.colorScheme,
                  layout: config?.layout,
                  imagery: config?.imagery,
                }
              : banner
          )
        );
        resolve();
      }, 2000);
    });
  };

  const addRegistrationField = () => {
    if (!newFieldName.trim()) return;
    setRegistrationFields([
      ...registrationFields,
      { id: Date.now(), name: newFieldName, type: "text", required: false },
    ]);
    setNewFieldName("");
  };

  const removeRegistrationField = (id: number) => {
    setRegistrationFields((fields) => fields.filter((f) => f.id !== id));
  };

  const toggleFieldRequired = (id: number) => {
    setRegistrationFields((fields) =>
      fields.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      console.log('=== STARTING EVENT DELETION ===');
      console.log('Event ID to delete:', eventId);

      await deleteEvent(eventId);

      console.log('=== EVENT DELETION SUCCESSFUL ===');
      console.log('Event deleted successfully:', eventId);

    } catch (error) {
      console.error("=== EVENT DELETION FAILED ===");
      console.error("Error details:", error);
      
      // Re-throw the error so the calling component can handle it
      throw error;
    }
  };

  return {
    eventData,
    showAIOutput,
    isGenerating,
    generatedBanners,
    isGeneratingBanner,
    registrationFields,
    newFieldName,
    handleEventSubmit,
    handleInputChange,
    handleDeleteEvent,
    resetForm,
    generateBanners,
    refreshBanner,
    addRegistrationField,
    removeRegistrationField,
    toggleFieldRequired,
    setNewFieldName,
  };
};
