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
  RegistrationFields,
} from "../components";
import { useEventManager } from "../hooks/useEventManager";

export default function AIEventManager() {
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
    generateBanners,
    refreshBanner,
    addRegistrationField,
    removeRegistrationField,
    toggleFieldRequired,
    setNewFieldName,
  } = useEventManager();

  const [activeTab, setActiveTab] = React.useState<
    "ai" | "banner" | "registration" | "reminders" | "classroom"
  >("ai");

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased relative overflow-hidden">
      <Background />
      <Header />

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Event Creation Form */}
        <EventCreationForm
          eventData={eventData}
          onInputChange={handleInputChange}
          onSubmit={handleEventSubmit}
          isGenerating={isGenerating}
        />

        {/* AI Generated Content in Tabs */}
        {showAIOutput && (
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl shadow-2xl p-8">
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
