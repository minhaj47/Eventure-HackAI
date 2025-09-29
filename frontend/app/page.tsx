"use client";
import React from "react";
import {
  AIGeneratedContent,
  AutomatedReminders,
  Background,
  BannerGenerator,
  ClassroomManagement,
  EventCreationForm,
  Footer,
  Header,
  LandingPage,
  RegistrationFields,
} from "../components";
import { useEventManager } from "../hooks/useEventManager";
import { PurposeType } from "../types";
import { BackendEvent } from "../hooks/useEvents";

// Local Event interface for this page that matches LandingPage's Event interface
interface LandingPageEvent {
  id: string;
  name: string;
  eventType: string;
  datetime: string;
  location: string;
  description: string;
  attendeeCount: number;
  status: "upcoming" | "ongoing" | "completed";
  createdAt: string;
  registrationFormUrl?: string;
  registrationFormEditUrl?: string;
  className?: string;
  classroomcode?: string;
  classroomlink?: string;
}

// Extended Event interface for selected events with additional fields
interface Event extends LandingPageEvent {
  _id: string;
  eventType: PurposeType;
  className?: string;
  classroomcode?: string;
  classroomlink?: string;
}

export default function AIEventManager() {
  const [currentView, setCurrentView] = React.useState<
    "landing" | "eventManager" | "eventDetails"
  >("landing");
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(() => {
    // Try to restore selected event from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eventure-selected-event');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved event:', e);
        }
      }
    }
    return null;
  });
  const [eventCreated, setEventCreated] = React.useState(() => {
    // Try to restore event created state from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eventure-event-created');
      return saved === 'true';
    }
    return false;
  });

  // Save selectedEvent to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedEvent) {
        localStorage.setItem('eventure-selected-event', JSON.stringify(selectedEvent));
      } else {
        localStorage.removeItem('eventure-selected-event');
      }
    }
  }, [selectedEvent]);

  // Save eventCreated state to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('eventure-event-created', eventCreated.toString());
    }
  }, [eventCreated]);

  // Restore view state when component mounts if there's a saved event
  React.useEffect(() => {
    if (selectedEvent && eventCreated && currentView !== "eventDetails") {
      setCurrentView("eventDetails");
      // Only set tab if no saved tab exists, or if current tab is not valid for the event
      const hasRegistration = selectedEvent.registrationFormUrl || selectedEvent.registrationFormEditUrl;
      const hasClassroom = selectedEvent.classroomcode && selectedEvent.classroomlink;
      const savedTab = typeof window !== 'undefined' ? localStorage.getItem('eventure-active-tab') : null;
      
      // If there's a saved tab and it's valid for current event data, use it
      if (savedTab && 
          ((savedTab === 'registration' && hasRegistration) ||
           (savedTab === 'classroom' && hasClassroom) ||
           ['ai', 'banner', 'reminders'].includes(savedTab))) {
        setActiveTab(savedTab as "ai" | "banner" | "registration" | "reminders" | "classroom");
      } else {
        // Otherwise, choose based on what exists
        if (hasRegistration && hasClassroom) {
          // If both exist, prefer registration (user likely just created forms)
          setActiveTab("registration");
        } else if (hasClassroom) {
          setActiveTab("classroom");
        } else if (hasRegistration) {
          setActiveTab("registration");
        } else {
          setActiveTab("ai");
        }
      }
    }
  }, [selectedEvent, eventCreated, currentView]); // Run when these values change

    const handleEventCreated = (createdEvent?: BackendEvent) => {
    console.log('=== HANDLE EVENT CREATED CALLED ===', createdEvent);
    
    if (!createdEvent) {
      console.log('No created event provided');
      return;
    }
    
    // Always show event details when an event is created
    console.log('Event created, switching to details view');
    
    const formattedEvent: Event = {
      _id: createdEvent._id,
      id: createdEvent._id || Date.now().toString(),
      name: createdEvent.eventName,
      eventType: createdEvent.eventType as PurposeType,
      datetime: createdEvent.dateTime,
      location: createdEvent.location || "",
      description: createdEvent.description || "",
      attendeeCount: 0,
      status: new Date(createdEvent.dateTime) > new Date() ? "upcoming" : "completed",
      createdAt: new Date().toISOString(),
      registrationFormUrl: createdEvent.registrationFormUrl,
      registrationFormEditUrl: createdEvent.registrationFormEditUrl,
      className: createdEvent.className,
      classroomcode: createdEvent.classroomcode,
      classroomlink: createdEvent.classroomlink,
    };
    
    setSelectedEvent(formattedEvent);
    setEventCreated(true);
    setCurrentView("eventDetails");
    
    // Set appropriate tab based on what was created
    const hasRegistration = createdEvent.registrationFormUrl && createdEvent.registrationFormEditUrl;
    const hasClassroom = createdEvent.classroomcode && createdEvent.classroomlink;
    
    if (hasRegistration && hasClassroom) {
      // If both exist, show registration first (since forms are usually created during event creation)
      setActiveTab("registration");
      console.log('=== SWITCHING TO EVENT DETAILS VIEW WITH REGISTRATION TAB (both exist) ===');
    } else if (hasClassroom) {
      setActiveTab("classroom");
      console.log('=== SWITCHING TO EVENT DETAILS VIEW WITH CLASSROOM TAB ===');
    } else if (hasRegistration) {
      setActiveTab("registration");
      console.log('=== SWITCHING TO EVENT DETAILS VIEW WITH REGISTRATION TAB ===');
    } else {
      setActiveTab("ai");
      console.log('=== SWITCHING TO EVENT DETAILS VIEW WITH AI TAB ===');
    }
  };

  const {
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
  } = useEventManager(handleEventCreated);

  const [activeTab, setActiveTab] = React.useState<
    "ai" | "banner" | "registration" | "reminders" | "classroom"
  >(() => {
    // Try to restore active tab from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eventure-active-tab');
      if (saved && ['ai', 'banner', 'registration', 'reminders', 'classroom'].includes(saved)) {
        return saved as "ai" | "banner" | "registration" | "reminders" | "classroom";
      }
    }
    return "ai";
  });

  // Save activeTab to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('eventure-active-tab', activeTab);
    }
  }, [activeTab]);

  const handleCreateEvent = () => {
    setCurrentView("eventManager");
    setSelectedEvent(null);
    setEventCreated(false);
    resetForm();
    // Clear localStorage when creating a new event
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eventure-selected-event');
      localStorage.setItem('eventure-event-created', 'false');
      localStorage.removeItem('eventure-active-tab'); // Reset tab when creating new event
    }
  };

  const handleSelectEvent = (event: LandingPageEvent) => {
    // Convert LandingPageEvent to Event for internal use
    const extendedEvent: Event = {
      ...event,
      _id: event.id, // Use id as _id for backward compatibility
      eventType: event.eventType as PurposeType,
      className: event.className, // Ensure className is passed through
    };
    setSelectedEvent(extendedEvent);
    setCurrentView("eventDetails");
    setEventCreated(false);
  };

  const handleBackToLanding = () => {
    setCurrentView("landing");
    setSelectedEvent(null);
    setEventCreated(false);
    // Clear localStorage when going back to landing
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eventure-selected-event');
      localStorage.setItem('eventure-event-created', 'false');
      localStorage.removeItem('eventure-active-tab'); // Reset tab when going back
    }
  };

  if (currentView === "landing") {
    return (
      <LandingPage
        onCreateEvent={handleCreateEvent}
        onSelectEvent={handleSelectEvent}
      />
    );
  }

  // Event details view for existing events
  if (currentView === "eventDetails" && selectedEvent) {
    return (
      <div
        className="min-h-screen text-white font-sans antialiased relative overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(to top, #30cfd0 0%, #330867 100%)",
        }}
      >
        <Background />
        <Header />

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          {/* Back to Dashboard Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToLanding}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/30 rounded-lg transition-all duration-200"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>

            <div className="text-right">
              <h2 className="text-lg font-semibold text-white">
                {selectedEvent.name}
              </h2>
              <p className="text-sm text-white/80">{selectedEvent.eventType}</p>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-white/10 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Event Information
                </h3>
                <div className="space-y-3 text-white/90">
                  <p>
                    <span className="text-white/70">Date:</span>{" "}
                    {new Date(selectedEvent.datetime).toLocaleString()}
                  </p>
                  <p>
                    <span className="text-white/70">Location:</span>{" "}
                    {selectedEvent.location}
                  </p>
                  <p>
                    <span className="text-white/70">Type:</span>{" "}
                    {selectedEvent.eventType}
                  </p>
                  <p>
                    <span className="text-white/70">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        selectedEvent.status === "upcoming"
                          ? "bg-blue-900/30 text-blue-300"
                          : selectedEvent.status === "ongoing"
                          ? "bg-green-900/30 text-green-300"
                          : "bg-gray-900/30 text-gray-300"
                      }`}
                    >
                      {selectedEvent.status}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Description
                </h3>
                <p className="text-white/90">
                  {selectedEvent.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Event Management Tools - Only show for existing events */}
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-white/10 p-8">
            <div className="flex space-x-4 mb-8">
              {[
                { label: "Announcement", key: "ai" },
                { label: "Banners", key: "banner" },
                { label: "Attendee Registration", key: "registration" },
                { label: "Mail", key: "reminders" },
                { label: "Classroom", key: "classroom" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                    activeTab === tab.key
                      ? "bg-cyan-500 text-black shadow-lg"
                      : "bg-gray-800 text-gray-300 hover:bg-cyan-700"
                  }`}
                  onClick={() =>
                    setActiveTab(
                      tab.key as
                        | "ai"
                        | "banner"
                        | "registration"
                        | "reminders"
                        | "classroom"
                    )
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="mt-4">
              {activeTab === "ai" && (
                <AIGeneratedContent
                  eventData={{
                    name: selectedEvent.name,
                    datetime: selectedEvent.datetime,
                    location: selectedEvent.location,
                    eventType: selectedEvent.eventType,
                    description: selectedEvent.description,
                  }}
                />
              )}
              {activeTab === "banner" && (
                <BannerGenerator
                  eventData={{
                    name: selectedEvent.name,
                    datetime: selectedEvent.datetime,
                    location: selectedEvent.location,
                    eventType: selectedEvent.eventType,
                    description: selectedEvent.description,
                  }}
                  generatedBanners={generatedBanners}
                  isGeneratingBanner={isGeneratingBanner}
                  onGenerateBanners={generateBanners}
                  onRefreshBanner={refreshBanner}
                />
              )}
              {activeTab === "registration" && (
                <div>
                  <RegistrationFields
                    registrationFields={registrationFields}
                    newFieldName={newFieldName}
                    onNewFieldNameChange={setNewFieldName}
                    onAddField={addRegistrationField}
                    onRemoveField={removeRegistrationField}
                    onToggleRequired={toggleFieldRequired}
                    eventData={{
                      eventName: selectedEvent.name,
                      dateTime: selectedEvent.datetime,
                      location: selectedEvent.location,
                      eventType: selectedEvent.eventType as PurposeType,
                      description: selectedEvent.description,
                      registrationFormUrl: selectedEvent.registrationFormUrl,
                      registrationFormEditUrl:
                        selectedEvent.registrationFormEditUrl,
                    }}
                    eventId={selectedEvent.id}
                  />
                </div>
              )}
              {activeTab === "reminders" && (
                <AutomatedReminders
                  eventData={{
                    name: selectedEvent.name,
                    datetime: selectedEvent.datetime,
                    location: selectedEvent.location,
                    eventType: selectedEvent.eventType,
                    description: selectedEvent.description,
                  }}
                />
              )}
              {activeTab === "classroom" && (
                <ClassroomManagement
                  eventData={{
                    name: selectedEvent.name,
                    datetime: selectedEvent.datetime,
                    location: selectedEvent.location,
                    eventType: selectedEvent.eventType,
                    description: selectedEvent.description,
                    className: selectedEvent.className,
                    classroomcode: selectedEvent.classroomcode,
                    classroomlink: selectedEvent.classroomlink,
                  }}
                  eventId={selectedEvent._id}
                  onClassroomUpdate={(classroomData: {
                    className: string;
                    classroomcode: string;
                    classroomlink: string;
                  }) => {
                    // Update the selectedEvent with new classroom data
                    setSelectedEvent(prev => prev ? {
                      ...prev,
                      className: classroomData.className,
                      classroomcode: classroomData.classroomcode,
                      classroomlink: classroomData.classroomlink,
                    } : null);
                  }}
                />
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Event manager view for creating new events
  return (
    <div
      className="min-h-screen text-white font-sans antialiased relative overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(to top, #30cfd0 0%, #330867 100%)",
      }}
    >
      <Background />
      <Header />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Back to Dashboard Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToLanding}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white/90 hover:text-white border border-gray-600/30 rounded-lg transition-all duration-200"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>

          <div className="text-right">
            <h2 className="text-lg font-semibold text-white">
              {eventCreated
                ? "Event Created Successfully!"
                : "Create New Event"}
            </h2>
            <p className="text-sm text-white/80">
              {eventCreated
                ? "Generate content and manage your event"
                : "Fill in the details to get started"}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {eventCreated && (
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-300">
                    Event Created Successfully!
                  </h3>
                  <p className="text-green-400/80">
                    Your event &quot;{eventData.eventName}&quot; has been created and
                    saved.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEventCreated(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Create Another Event
              </button>
            </div>
          </div>
        )}

        {/* Event Creation Form - Only show if event hasn't been created */}
        {!eventCreated && (
          <>
            <EventCreationForm
              eventData={eventData}
              onInputChange={handleInputChange}
              onSubmit={handleEventSubmit}
              isGenerating={isGenerating}
            />
            
            {/* Enhanced Loading Indicator for Form Creation */}
            {isGenerating && (
              <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-400/20 p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-2">
                    Creating Your Event & Registration Form
                  </h3>
                  <div className="space-y-2 text-sm text-cyan-200/80">
                    <p>🎯 Setting up your event details...</p>
                    <p>📋 Generating Google registration form...</p>
                    <p>🔗 Configuring form URLs and permissions...</p>
                    <p className="text-xs text-cyan-300/60 mt-4">
                      This may take 30-60 seconds. Please wait while we create your complete event setup.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* AI Generated Content in Tabs - Show after event creation, form submission, or classroom creation */}
        {(showAIOutput || eventCreated || (selectedEvent && (
          selectedEvent.registrationFormUrl || 
          selectedEvent.registrationFormEditUrl || 
          selectedEvent.classroomcode || 
          selectedEvent.classroomlink
        ))) && (
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-white/10 p-8">
            <div className="flex space-x-4 mb-8">
              {[
                { label: "Announcement", key: "ai" },
                { label: "Banners", key: "banner" },
                { label: "Attendee Registration", key: "registration" },
                { label: "Mail", key: "reminders" },
                { label: "Classroom", key: "classroom" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                    activeTab === tab.key
                      ? "bg-cyan-500 text-black shadow-lg"
                      : "bg-gray-800 text-gray-300 hover:bg-cyan-700"
                  }`}
                  onClick={() =>
                    setActiveTab(
                      tab.key as
                        | "ai"
                        | "banner"
                        | "registration"
                        | "reminders"
                        | "classroom"
                    )
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="mt-4">
              {activeTab === "ai" && (
                <AIGeneratedContent
                  eventData={{
                    name: eventData.eventName,
                    datetime: eventData.dateTime,
                    location: eventData.location,
                    eventType: eventData.eventType,
                    description: eventData.description,
                  }}
                />
              )}
              {activeTab === "banner" && (
                <BannerGenerator
                  eventData={{
                    name: eventData.eventName,
                    datetime: eventData.dateTime,
                    location: eventData.location,
                    eventType: eventData.eventType,
                    description: eventData.description,
                  }}
                  generatedBanners={generatedBanners}
                  isGeneratingBanner={isGeneratingBanner}
                  onGenerateBanners={generateBanners}
                  onRefreshBanner={refreshBanner}
                />
              )}
              {activeTab === "registration" && (
                <RegistrationFields
                  registrationFields={registrationFields}
                  newFieldName={newFieldName}
                  onNewFieldNameChange={setNewFieldName}
                  onAddField={addRegistrationField}
                  onRemoveField={removeRegistrationField}
                  onToggleRequired={toggleFieldRequired}
                  eventData={eventData}
                />
              )}
              {activeTab === "reminders" && (
                <AutomatedReminders
                  eventData={{
                    name: eventData.eventName,
                    datetime: eventData.dateTime,
                    location: eventData.location,
                    eventType: eventData.eventType,
                    description: eventData.description,
                  }}
                />
              )}
              {activeTab === "classroom" && (
                <ClassroomManagement
                  eventData={{
                    name: eventData.eventName,
                    datetime: eventData.dateTime,
                    location: eventData.location,
                    eventType: eventData.eventType,
                    description: eventData.description,
                    className: eventData.className,
                    classroomcode: eventData.classroomcode,
                    classroomlink: eventData.classroomlink,
                  }}
                  eventId={undefined} // New events don't have ID yet
                />
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
