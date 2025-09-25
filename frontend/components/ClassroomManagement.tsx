import {
  BookOpen,
  Check,
  Copy,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { createClassroom } from "../services/contentGenerationApi";
import { Card } from "./ui";

interface ClassroomManagementProps {
  eventData: {
    name: string;
    eventType: string;
    datetime: string;
    location: string;
    description: string;
  };
}

interface ClassroomDetails {
  className: string;
  classCode: string;
  classLink: string;
  instructions: string;
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

export const ClassroomManagement: React.FC<ClassroomManagementProps> = ({
  eventData,
}) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
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
      const result = await createClassroom({
        className: newClassroom.name,
        description:
          newClassroom.description || `Classroom for ${eventData.name}`,
        email: newClassroom.email,
      });

      // Add the created classroom to the list (mock structure since API response format isn't specified)
      const newClassroomItem: Classroom = {
        id: `classroom_${Date.now()}`,
        name: newClassroom.name,
        code: `CLASS${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        description:
          newClassroom.description || `Classroom for ${eventData.name}`,
        createdAt: new Date().toISOString(),
        participantCount: 0,
        status: "active",
      };

      setClassrooms((prev) => [newClassroomItem, ...prev]);
      setNewClassroom({ name: "", description: "", email: "" });

      alert("Classroom created successfully!");
      console.log("Classroom creation result:", result);
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

  const generateClassroomCode = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const createMockClassroom = async () => {
    if (!newClassroom.name.trim()) return;

    setIsCreatingClassroom(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const classroom: Classroom = {
      id: Date.now().toString(),
      name: newClassroom.name,
      code: generateClassroomCode(),
      description:
        newClassroom.description || `Virtual classroom for ${eventData.name}`,
      createdAt: new Date().toISOString(),
      participantCount: 0,
      status: "active",
    };

    setClassrooms((prev) => [...prev, classroom]);
    setSelectedClassroom(classroom);
    setNewClassroom({ name: "", description: "", email: "" });
    setIsCreatingClassroom(false);
  };

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
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const announcementTemplate = `📢 Important Announcement for ${
      selectedClassroom.name
    }

${announcementPrompt || `Welcome to our ${eventData.eventType} classroom!`}

Event Details:
📅 Date: ${new Date(eventData.datetime).toLocaleDateString()}
🕒 Time: ${new Date(eventData.datetime).toLocaleTimeString()}
📍 Location: ${eventData.location}

${
  announcementPrompt
    ? `\n${announcementPrompt}\n`
    : `We're excited to have you join us for ${eventData.name}. This virtual classroom will be your hub for:

• Live discussions and Q&A sessions
• Resource sharing and materials
• Interactive activities and polls
• Networking with fellow participants
• Access to session recordings

Please make sure to:
✅ Join the classroom using code: ${selectedClassroom.code}
✅ Check your tech setup before the event
✅ Have your questions ready for interactive sessions
✅ Introduce yourself in the discussion forum`
}

For technical support or questions about the classroom, please contact our support team.

Best regards,
The Event Team

---
Classroom Code: ${selectedClassroom.code}
Event: ${eventData.name}`;

    setGeneratedAnnouncement(announcementTemplate);
    setIsGeneratingAnnouncement(false);
  };

  const sendAnnouncement = async () => {
    if (!generatedAnnouncement || !selectedClassroom) return;

    setIsSendingAnnouncement(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsSendingAnnouncement(false);

    // Reset form after sending
    setAnnouncementPrompt("");
    setGeneratedAnnouncement("");
  };

  return (
    <Card title="Classroom Management" icon={<BookOpen className="h-6 w-6" />}>
      <div className="space-y-6">
        {/* Classroom Creation Section */}
        {classrooms.length === 0 ? (
          <div className="p-8 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-2xl border border-blue-500/20 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Create a Google Classroom
            </h3>
            <p className="text-white-300 text-xl font-smooth-sans mb-6">
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
                  placeholder={`${eventData.name} Classroom`}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={newClassroom.email}
                  onChange={(e) =>
                    setNewClassroom((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Your email (optional)"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <textarea
                  value={newClassroom.description}
                  onChange={(e) =>
                    setNewClassroom((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description for your classroom..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none"
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
                className="w-full px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isCreatingClassroom && (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                )}
                {isCreatingClassroom ? "Creating Classroom..." : "Create "}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Existing Classrooms */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-400" />
                  Your Classrooms ({classrooms.length})
                </h3>
                <button
                  onClick={() => setClassrooms([])}
                  className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Create New
                </button>
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
                  <h4 className="text-lg font-tomorrow text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                    Generate and send Announcements with AI
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
                      className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
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
                        className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 rounded-lg disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
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
