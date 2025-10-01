import {
  BookOpen,
  Check,
  Copy,
  MessageSquare,
  
  RefreshCw,
  Send,
  Sparkles,
  
} from "lucide-react";
import React, { useState } from "react";
import { createClassroom } from "../services/contentGenerationApi";
import { updateEventClassroom, sendClassroomAnnouncement, generateEventAnnouncement } from "../services/apiService";
import { Card } from "./ui";

interface ClassroomManagementProps {
  eventData: {
    name: string;
    eventType: string;
    datetime: string;
    location: string;
    description: string;
    className?:string;
    classroomcode?: string;
    classroomlink?: string;
  };
  eventId?: string;
  onClassroomUpdate?: (classroomData: {
    className: string;
    classroomcode: string;
    classroomlink: string;
  }) => void;
}

interface Classroom {
  id: string;
  name: string;
  code: string;
  link: string;
  description: string;
  createdAt: string;
  participantCount: number;
  status: "active" | "archived";
}

interface ClassroomApiResponse {
  id?: string;
  classroomId?: string;
  classroomLink?: string;
  result?: {
    Output?: {
      classroomDetails?: {
        className?: string;
        classCode?: string;
        classLink?: string;
        instructions?: string;
      };
    };
  };
}

export const ClassroomManagement: React.FC<ClassroomManagementProps> = ({
  eventData,
  eventId,
  onClassroomUpdate,
}) => {
  // Initialize with existing classroom data if available
  const [classrooms, setClassrooms] = useState<Classroom[]>(
    eventData.classroomcode && eventData.classroomlink && eventData.className
      ? [
          {
            id: "existing-classroom",
            name: eventData.className,
            code: eventData.classroomcode,
            link: eventData.classroomlink,
            description: `Classroom for ${eventData.name}`,
            createdAt: new Date().toISOString(),
            participantCount: 0,
            status: "active" as const,
          },
        ]
      : []
  );
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(
    null
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Classroom creation form
  const [newClassroom, setNewClassroom] = useState({
    name: "",
    description: "",
    email: "",
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateClassroom = async () => {
    if (!newClassroom.name.trim()) {
      setCreateError("Classroom name is required");
      return;
    }

    setIsCreatingClassroom(true);
    setCreateError(null);

    try {
      const response = await createClassroom({
        className: newClassroom.name,
        description:
          newClassroom.description || `Classroom for ${eventData.name}`,
        email: newClassroom.email,
      });

      // Add the created classroom to the list
      // Handle response structure based on actual API response
      const responseData = response as ClassroomApiResponse;
      const classroomDetails = responseData?.result?.Output?.classroomDetails;
      const newClassroomItem: Classroom = {
        id: (responseData?.id as string) || Date.now().toString(),
        name: classroomDetails?.className || newClassroom.name,
        code: classroomDetails?.classCode || responseData?.classroomId || '',
        link: classroomDetails?.classLink || responseData?.classroomLink || '',
        description: classroomDetails?.instructions || newClassroom.description,
        createdAt: new Date().toISOString(),
        participantCount: 0,
        status: "active",
      };

      setClassrooms((prev) => [newClassroomItem, ...prev]);

      // Save classroom data to the event if eventId is provided
      if (eventId && newClassroomItem.code && newClassroomItem.link && newClassroom.name) {
        try {
          console.log('=== SAVING CLASSROOM DATA TO EVENT ===');
          console.log('Event ID:', eventId);
          console.log('Classroom Code:', newClassroomItem.code);
          console.log('Classroom Link:', newClassroomItem.link);

          const updateResult = await updateEventClassroom(eventId, {
            className: newClassroomItem.name,
            classroomcode: newClassroomItem.code,
            classroomlink: newClassroomItem.link,
          });

          console.log('=== CLASSROOM DATA SAVED TO EVENT ===');
          console.log('Update result:', updateResult);

          if (updateResult.success) {
            alert("Classroom created and saved to event successfully!");
            
            // Call the callback to update parent component state
            onClassroomUpdate?.({
              className: newClassroomItem.name,
              classroomcode: newClassroomItem.code,
              classroomlink: newClassroomItem.link,
            });
          } else {
            alert("Classroom created, but failed to save to event. You can update it manually.");
          }
        } catch (error) {
          console.error('Failed to save classroom data to event:', error);
          alert("Classroom created, but failed to save to event. You can update it manually.");
        }
      } else {
        alert("Classroom created successfully!");
      }

      // Reset form after successful creation
      setNewClassroom({ name: "", description: "", email: "" });
      
      console.log("Classroom creation result:", response);
    } catch (error) {
      console.error("Failed to create classroom:", error);
      setCreateError("Failed to create classroom. Please try again.");
    } finally {
      setIsCreatingClassroom(false);
    }
  };

  // Announcement states
  const [announcementPrompt, setAnnouncementPrompt] = useState("");
  const [generatedAnnouncement, setGeneratedAnnouncement] = useState("");
  const [isGeneratingAnnouncement, setIsGeneratingAnnouncement] =
    useState(false);
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [regenerationSuggestions, setRegenerationSuggestions] = useState("");
  const [showRegenerateOptions, setShowRegenerateOptions] = useState(false);

  const copyClassroomCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  const generateAnnouncement = async () => {
    if (!selectedClassroom) return;

    setIsGeneratingAnnouncement(true);
    try {
      // Use AI-powered announcement generation
      const announcementMessage = announcementPrompt || `Welcome to our ${eventData.eventType} classroom! We're excited to have you join us for this event.`;
      
      // Create detailed suggestions like email generator does
      const suggestions = `${announcementPrompt || "Classroom announcement"}. Include event details: Date: ${new Date(eventData.datetime).toLocaleDateString()}, Time: ${new Date(eventData.datetime).toLocaleTimeString()}, Location: ${eventData.location}, Classroom Code: ${selectedClassroom.code}. Make it engaging, professional, and include call-to-action for students to join the classroom.`;

      const generatedContent = await generateEventAnnouncement({
        announcementMessage: announcementMessage,
        eventName: eventData.name,
        eventType: eventData.eventType,
        suggestions: suggestions
      });

      setGeneratedAnnouncement(generatedContent);
    } catch (error) {
      console.error("Failed to generate announcement:", error);
      setGeneratedAnnouncement("Sorry, we couldn't generate the announcement at this time. Please try again later.");
    } finally {
      setIsGeneratingAnnouncement(false);
    }
  };

  const regenerateAnnouncement = async () => {
    if (!regenerationSuggestions.trim() || !selectedClassroom) {
      alert("Please provide suggestions for regeneration");
      return;
    }

    setIsGeneratingAnnouncement(true);
    try {
      // Create enhanced announcement message with user feedback
      const enhancedMessage = `${announcementPrompt || `Welcome to our ${eventData.eventType} classroom!`}

Previous announcement was generated. User feedback for improvement: ${regenerationSuggestions}`;

      // Create detailed suggestions including user feedback
      const suggestions = `Original request: ${announcementPrompt || "Classroom announcement"}. User feedback for improvement: ${regenerationSuggestions}. Include event details: Date: ${new Date(eventData.datetime).toLocaleDateString()}, Time: ${new Date(eventData.datetime).toLocaleTimeString()}, Location: ${eventData.location}, Classroom Code: ${selectedClassroom.code}. Make it engaging and professional.`;

      const regeneratedContent = await generateEventAnnouncement({
        announcementMessage: enhancedMessage,
        eventName: eventData.name,
        eventType: eventData.eventType,
        suggestions: suggestions
      });

      setGeneratedAnnouncement(regeneratedContent);
      setShowRegenerateOptions(false);
      setRegenerationSuggestions("");
    } catch (error) {
      console.error("Failed to regenerate announcement:", error);
      alert("Failed to regenerate announcement. Please try again.");
    } finally {
      setIsGeneratingAnnouncement(false);
    }
  };

  const sendAnnouncement = async () => {
    if (!generatedAnnouncement || !selectedClassroom) return;

    setIsSendingAnnouncement(true);
    try {
      // Use API service to send announcement
      const result = await sendClassroomAnnouncement({
        className: selectedClassroom.name, // className from frontend maps to courseName in backend
        announcementText: generatedAnnouncement,
      });

      if (result.success) {
        alert("Announcement sent successfully!");
        setAnnouncementPrompt("");
        setGeneratedAnnouncement("");
      } else {
        alert("Failed to send announcement: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Failed to send announcement:", error);
      alert("Failed to send announcement. Please try again.");
    } finally {
      setIsSendingAnnouncement(false);
    }
  };

  
  // Removed manual classroom update functionality due to backend connectivity issues

  return (
    <Card title="Classroom Management" icon={<BookOpen className="h-6 w-6" />}>
      <div className="space-y-6">
        {/* Manual classroom update section removed due to backend connectivity issues */}

        {/* Classroom Creation Section */}
        {classrooms.length === 0 ? (
          <div className="p-8 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-2xl border border-blue-500/20 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Create a Google Classroom
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              Set up a dedicated space for your event participants to
              collaborate and engage.
            </p>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <input
                  type="text"
                  value={newClassroom.name}
                  onChange={(e) =>
                    setNewClassroom((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder={"Classroom Name"}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              {createError && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  {createError}
                </div>
              )}
              <button
                onClick={handleCreateClassroom}
                disabled={isCreatingClassroom || !newClassroom.name.trim()}
                className="w-full px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isCreatingClassroom && (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                )}
                {isCreatingClassroom ? "Creating Classroom..." : "Create Classroom"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Existing Classrooms */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">     
              </div>

              {classrooms.map((classroom) => (
                <div
                  key={classroom.id}
                  className={`p-6 bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    selectedClassroom?.id === classroom.id
                      ? "border-green-500/50 shadow-lg shadow-green-500/10"
                      : "border-green-500/20 hover:border-green-500/40"
                  }`}
                  onClick={() => setSelectedClassroom(classroom)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-semibold">
                          {classroom.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            classroom.status === "active"
                              ? "bg-green-900/30 text-green-300 border border-green-500/30"
                              : "bg-gray-900/30 text-gray-300 border border-gray-500/30"
                          }`}
                        >
                          {classroom.status}
                        </span>
                      </div>
                      {/* Join Classroom Link - Copy and Share */}
                      {classroom.link && (
                        <div className="mb-3 space-y-2">
                          {/* Copy Link Button */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyClassroomCode(classroom.link);
                              }}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg transition-all duration-200 text-sm"
                            >
                              {copiedCode === classroom.link ? (
                                <Check className="h-3 w-3 text-green-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              {copiedCode === classroom.link ? 'Copied!' : 'Copy Join Link'}
                            </button>
                          </div>
                          
                          {/* Share Options */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Share:</span>
                            
                            {/* WhatsApp Share */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const message = `Join our classroom "${classroom.name}" using this link: ${classroom.link}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                              }}
                              className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all duration-200"
                              title="Share on WhatsApp"
                            >
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                              </svg>
                            </button>

                            {/* Telegram Share */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const message = `Join our classroom "${classroom.name}" using this link: ${classroom.link}`;
                                window.open(`https://t.me/share/url?url=${encodeURIComponent(classroom.link)}&text=${encodeURIComponent(message)}`, '_blank');
                              }}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200"
                              title="Share on Telegram"
                            >
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                              </svg>
                            </button>

                            {/* Facebook Share */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(classroom.link)}`, '_blank');
                              }}
                              className="p-2 bg-blue-700/20 hover:bg-blue-700/30 text-blue-400 rounded-lg transition-all duration-200"
                              title="Share on Facebook"
                            >
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Description/Instructions */}
                      <p className="text-gray-400 text-sm mb-3">
                        {classroom.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Created:{" "}
                          {new Date(classroom.createdAt).toLocaleDateString()}
                        </span>
                        <span>Participants: {classroom.participantCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-300 mb-1">
                          Classroom Code
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-800/50 px-3 py-2 rounded-lg text-green-400 font-mono text-lg font-bold">
                            {classroom.code}
                          </code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyClassroomCode(classroom.code);
                            }}
                            className="p-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
                            title="Copy classroom code"
                          >
                            {copiedCode === classroom.code ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Announcement Management */}
            {selectedClassroom && (
              <div className="p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/20">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                    Generate and Send Announcements with AI
                  </h4>
                </div>

                {/* Announcement Prompt */}
                <div className="mb-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={announcementPrompt}
                      onChange={(e) => setAnnouncementPrompt(e.target.value)}
                      placeholder="e.g., 'Send a reminder about the next meeting'"
                      className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                    />
                    <button
                      onClick={generateAnnouncement}
                      disabled={isGeneratingAnnouncement}
                      className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                    >
                      {isGeneratingAnnouncement ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {isGeneratingAnnouncement ? "Generating..." : "Generate"}
                    </button>
                  </div>
                </div>

                {/* Generated Announcement */}
                {generatedAnnouncement && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-300">
                        Generated Announcement
                      </label>
                      <button
                        onClick={sendAnnouncement}
                        disabled={isSendingAnnouncement}
                        className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        {isSendingAnnouncement ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                        {isSendingAnnouncement
                          ? "Sending..."
                          : "Send Announcement"}
                      </button>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-600/30 rounded-xl p-4 text-gray-300 text-sm leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto">
                      {generatedAnnouncement}
                    </div>

                    {/* Regenerate Options */}
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => setShowRegenerateOptions(!showRegenerateOptions)}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Regenerate with Suggestions
                      </button>
                    </div>

                    {/* Regeneration Suggestions Input */}
                    {showRegenerateOptions && (
                      <div className="mt-4 space-y-3">
                        <label className="block text-sm font-medium text-gray-300">
                          Improvement Suggestions
                        </label>
                        <div className="flex gap-2">
                          <textarea
                            rows={2}
                            value={regenerationSuggestions}
                            onChange={(e) => setRegenerationSuggestions(e.target.value)}
                            placeholder="e.g., Make it more casual, add more details about networking opportunities..."
                            className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none"
                          />
                          <button
                            onClick={regenerateAnnouncement}
                            disabled={isGeneratingAnnouncement || !regenerationSuggestions.trim()}
                            className="px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                          >
                            {isGeneratingAnnouncement ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            {isGeneratingAnnouncement ? "Regenerating..." : "Regenerate"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};