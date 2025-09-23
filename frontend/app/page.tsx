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

interface Event {
  id: string;
  name: string;
  eventType: string;
  datetime: string;
  location: string;
  description: string;
  attendeeCount: number;
  status: "upcoming" | "ongoing" | "completed";
  createdAt: string;
}

export default function AIEventManager() {
  const [currentView, setCurrentView] = React.useState<
    "landing" | "eventManager" | "eventDetails"
  >("landing");
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [eventCreated, setEventCreated] = React.useState(false);

  const handleEventCreated = () => {
    setEventCreated(true);
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
  >("ai");

  const handleCreateEvent = () => {
    setCurrentView("eventManager");
    setSelectedEvent(null);
    setEventCreated(false);
    resetForm();
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setCurrentView("eventDetails");
    setEventCreated(false);
  };

  const handleBackToLanding = () => {
    setCurrentView("landing");
    setSelectedEvent(null);
    setEventCreated(false);
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
                    eventType: selectedEvent.eventType as any,
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
                    eventType: selectedEvent.eventType as any,
                    description: selectedEvent.description,
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
                />
              )}
              {activeTab === "reminders" && (
                <AutomatedReminders
                  eventData={{
                    name: selectedEvent.name,
                    datetime: selectedEvent.datetime,
                    location: selectedEvent.location,
                    eventType: selectedEvent.eventType as any,
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
                    eventType: selectedEvent.eventType as any,
                    description: selectedEvent.description,
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
                    Your event "{eventData.name}" has been created and saved.
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
          <EventCreationForm
            eventData={eventData}
            onInputChange={handleInputChange}
            onSubmit={handleEventSubmit}
            isGenerating={isGenerating}
          />
        )}

        {/* AI Generated Content in Tabs - Show after event creation or form submission */}
        {(showAIOutput || eventCreated) && (
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
                <AIGeneratedContent eventData={eventData} />
              )}
              {activeTab === "banner" && (
                <BannerGenerator
                  eventData={eventData}
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
                />
              )}
              {activeTab === "reminders" && (
                <AutomatedReminders eventData={eventData} />
              )}
              {activeTab === "classroom" && (
                <ClassroomManagement eventData={eventData} />
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
