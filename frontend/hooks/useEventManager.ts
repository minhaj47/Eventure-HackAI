import { useState } from "react";
import { Banner, BannerConfig, EventData, RegistrationField } from "../types";
import { useEvents } from "./useEvents";

export const useEventManager = (onEventCreated?: () => void) => {
  const { createEvent } = useEvents();

  const [eventData, setEventData] = useState<EventData>({
    name: "",
    datetime: "",
    location: "",
    description: "",
    eventType: "conference",
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
    { id: 3, name: "Phone Number", type: "tel", required: false },
    { id: 4, name: "Organization", type: "text", required: false },
  ]);
  const [newFieldName, setNewFieldName] = useState("");

  const handleEventSubmit = async () => {
    if (!eventData.name || !eventData.datetime || !eventData.location) return;

    setIsGenerating(true);

    try {
      // Create the actual event
      await createEvent({
        eventName: eventData.name,
        dateTime: eventData.datetime,
        location: eventData.location,
        eventType: eventData.eventType,
        description: eventData.description,
      });

      // Show AI output and call success callback
      setShowAIOutput(true);
      onEventCreated?.();
    } catch (error) {
      console.error("Failed to create event:", error);
      // Still show AI output even if event creation fails for now
      setShowAIOutput(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field: keyof EventData, value: string) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEventData({
      name: "",
      datetime: "",
      location: "",
      description: "",
      eventType: "conference",
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
    resetForm,
    generateBanners,
    refreshBanner,
    addRegistrationField,
    removeRegistrationField,
    toggleFieldRequired,
    setNewFieldName,
  };
};
