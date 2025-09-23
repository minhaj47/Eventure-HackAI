import {
  Bell,
  Clock,
  Edit3,
  Mail,
  RefreshCw,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { sendEventUpdate } from "../services/contentGenerationApi";
import { Card } from "./ui";

interface AutomatedRemindersProps {
  eventData: {
    name: string;
    eventType: string;
    datetime: string;
    location: string;
    description: string;
  };
}

export const AutomatedReminders: React.FC<AutomatedRemindersProps> = ({
  eventData,
}) => {
  // Email reminder states
  const [emailPrompt, setEmailPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSendingAll, setIsSendingAll] = useState(false);

  // Google Sheets integration
  const [sheetId, setSheetId] = useState("");
  const [sheetRange, setSheetRange] = useState("Sheet1!A:C");
  const [isUsingSheets, setIsUsingSheets] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<{
    [key: number]: boolean;
  }>({});

  // Mock participants data
  const [participants] = useState([
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex@example.com",
      status: "confirmed",
      registeredAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Sarah Chen",
      email: "sarah@example.com",
      status: "pending",
      registeredAt: "2024-01-16",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael@example.com",
      status: "confirmed",
      registeredAt: "2024-01-17",
    },
    {
      id: 4,
      name: "Emma Davis",
      email: "emma@example.com",
      status: "confirmed",
      registeredAt: "2024-01-18",
    },
    {
      id: 5,
      name: "James Wilson",
      email: "james@example.com",
      status: "pending",
      registeredAt: "2024-01-19",
    },
  ]);

  // Remove duplicate sendingStatus declaration
  // const [sendingStatus, setSendingStatus] = useState<{
  //   [key: number]: boolean;
  // }>({});

  const generateEmailReminder = async () => {
    setIsGeneratingEmail(true);
    // Simulate AI email generation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const emailTemplate = `Subject: ${
      emailPrompt || `Reminder: ${eventData.name} is Coming Up!`
    }

Dear [Participant Name],

This is a friendly reminder about the upcoming ${
      eventData.eventType || "event"
    }: ${eventData.name}.

Event Details:
📅 Date: ${new Date(eventData.datetime).toLocaleDateString()}
🕒 Time: ${new Date(eventData.datetime).toLocaleTimeString()}
📍 Location: ${eventData.location}

${
  emailPrompt
    ? `\n${emailPrompt}\n`
    : `
We're excited to have you join us for this ${eventData.eventType || "event"}. ${
        eventData.description ||
        "It's going to be an amazing experience with great networking opportunities and valuable insights."
      }

What to expect:
• Engaging presentations and discussions
• Networking opportunities with industry professionals
• Refreshments and interactive sessions
• Take-home resources and materials
`
}

Please confirm your attendance by replying to this email. If you have any questions or need to make changes to your registration, don't hesitate to reach out.

We look forward to seeing you there!

Best regards,
The Event Team

---
Need to cancel? Click here: [Unsubscribe Link]
Questions? Contact us at: events@company.com`;

    setGeneratedEmail(emailTemplate);
    setIsGeneratingEmail(false);
    setIsEditingEmail(true);
  };

  const sendEmailToParticipant = async (participantId: number) => {
    setSendingStatus((prev) => ({ ...prev, [participantId]: true }));
    // Simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSendingStatus((prev) => ({ ...prev, [participantId]: false }));
  };

  const sendViaGoogleSheets = async () => {
    if (!sheetId || !generatedEmail) {
      alert("Please provide a Google Sheet ID and generate an email first.");
      return;
    }

    setIsSendingAll(true);

    try {
      const result = await sendEventUpdate({
        sheetId: sheetId,
        eventName: eventData.name,
        eventMessage: generatedEmail,
        sheetRange: sheetRange,
      });

      alert("Event update sent successfully via Google Sheets!");
      console.log("Send result:", result);
    } catch (error) {
      console.error("Failed to send via Google Sheets:", error);
      alert(
        "Failed to send event update. Please check your Sheet ID and try again."
      );
    } finally {
      setIsSendingAll(false);
    }
  };

  const sendEmailToAll = async () => {
    setIsSendingAll(true);
    // Simulate sending to all participants
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsSendingAll(false);
  };
  return (
    <Card title="Automated Reminders" icon={<Bell className="h-6 w-6" />}>
      {/* Enhanced Email Reminder Section */}
      <div className="space-y-6">
        {/* Email Generation */}
        <div className="p-6 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-2xl border border-indigo-500/20">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lgb font-tomorrow text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-400" />
              Generate Mail
            </h4>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                Auto-reminder system
              </span>
            </div>
          </div>

          {/* Email Prompt Input */}
          <div className="mb-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={emailPrompt}
                onChange={(e) => setEmailPrompt(e.target.value)}
                placeholder="e.g., 'Include parking instructions and dress code information'"
                className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={generateEmailReminder}
                disabled={isGeneratingEmail}
                className="px-6 py-3 bg-indigo-600/20 font-tomorrow hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
              >
                {isGeneratingEmail ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isGeneratingEmail ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>

          {/* Generated Email Display */}
          {generatedEmail && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Generated Email Template
                </label>
                <button
                  onClick={() => setIsEditingEmail(!isEditingEmail)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Edit3 className="h-3 w-3" />
                  {isEditingEmail ? "View Mode" : "Edit Mode"}
                </button>
              </div>
              {isEditingEmail ? (
                <textarea
                  value={generatedEmail}
                  onChange={(e) => setGeneratedEmail(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-gray-300 font-mono text-sm leading-relaxed focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              ) : (
                <div className="bg-gray-900/50 border border-gray-600/30 rounded-xl p-4 text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto">
                  {generatedEmail}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Participants Management */}
        <div className="p-6 bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded-2xl border border-green-500/20">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              Participants ({participants.length})
            </h4>
            <button
              onClick={sendEmailToAll}
              disabled={isSendingAll || !generatedEmail}
              className="px-6 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 rounded-xl disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
            >
              {isSendingAll ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSendingAll ? "Sending to All..." : "Send to All Participants"}
            </button>
          </div>

          {/* Google Sheets Integration */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <h4 className="text-lg font-semibold text-white">
                Google Sheets Integration
              </h4>
              <button
                onClick={() => setIsUsingSheets(!isUsingSheets)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  isUsingSheets
                    ? "bg-green-600/20 text-green-300 border border-green-500/30"
                    : "bg-gray-600/20 text-gray-400 border border-gray-500/30"
                }`}
              >
                {isUsingSheets ? "Enabled" : "Enable"}
              </button>
            </div>

            {isUsingSheets && (
              <div className="bg-gray-950/40 rounded-xl p-6 border border-white/20 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Google Sheet ID
                  </label>
                  <input
                    type="text"
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    placeholder="Enter your Google Sheet ID"
                    className="w-full px-3 py-2 bg-gray-900/60 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sheet Range (optional)
                  </label>
                  <input
                    type="text"
                    value={sheetRange}
                    onChange={(e) => setSheetRange(e.target.value)}
                    placeholder="e.g., Sheet1!A:C"
                    className="w-full px-3 py-2 bg-gray-900/60 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <button
                  onClick={sendViaGoogleSheets}
                  disabled={isSendingAll || !generatedEmail || !sheetId}
                  className="w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isSendingAll ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isSendingAll ? "Sending..." : "Send via Google Sheets"}
                </button>
              </div>
            )}
          </div>

          {/* Participants List */}
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 bg-gray-900/30 border border-gray-600/20 rounded-xl hover:border-gray-500/40 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {participant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h5 className="text-white font-medium">
                      {participant.name}
                    </h5>
                    <p className="text-gray-400 text-sm">{participant.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        participant.status === "confirmed"
                          ? "bg-green-900/30 text-green-300 border border-green-500/30"
                          : "bg-yellow-900/30 text-yellow-300 border border-yellow-500/30"
                      }`}
                    >
                      {participant.status}
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      Registered:{" "}
                      {new Date(participant.registeredAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => sendEmailToParticipant(participant.id)}
                    disabled={sendingStatus[participant.id] || !generatedEmail}
                    className="px-4 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-lg disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                  >
                    {sendingStatus[participant.id] ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    {sendingStatus[participant.id] ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!generatedEmail && (
            <div className="mt-4 p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl">
              <p className="text-amber-300 text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Generate an email template first to enable sending reminders to
                participants.
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl border border-blue-500/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {participants.filter((p) => p.status === "confirmed").length}
              </div>
              <div className="text-sm text-gray-400">Confirmed</div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl border border-yellow-500/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {participants.filter((p) => p.status === "pending").length}
              </div>
              <div className="text-sm text-gray-400">Pending</div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {(
                  (participants.filter((p) => p.status === "confirmed").length /
                    participants.length) *
                  100
                ).toFixed(0)}
                %
              </div>
              <div className="text-sm text-gray-400">Response Rate</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
