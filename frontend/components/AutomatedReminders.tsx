import {
  Bell,
  Clock,
  Download,
  Edit3,
  Mail,
  RefreshCw,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { 
  generateEmailBody, 
  extractAllContactsFromSheet, 
  parseEmailContent,
  sendEmailToAllParticipants,
  sendSingleEmail,
  Contact 
} from "../services/apiService";
import { sendEventUpdate } from "../services/contentGenerationApi";
import { Card, Toast, useToast } from "./ui";

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
  // Toast notifications
  const { toasts, showToast, removeToast } = useToast();

  // Email reminder states
  const [emailPrompt, setEmailPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSendingAll, setIsSendingAll] = useState(false);

  // Regeneration states
  const [regenerationSuggestions, setRegenerationSuggestions] = useState("");
  const [showRegenerateOptions, setShowRegenerateOptions] = useState(false);

  // Google Sheets integration
  const [sheetId, setSheetId] = useState("");
  const [sheetRange, setSheetRange] = useState("Sheet1!A:C");
  const [isUsingSheets, setIsUsingSheets] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<{
    [key: number]: boolean;
  }>({});

  // Google Sheet Link for participant extraction
  const [googleSheetLink, setGoogleSheetLink] = useState("");
  const [isExtractingParticipants, setIsExtractingParticipants] = useState(false);
  
  // Participants data
  const [participants, setParticipants] = useState<Array<{
    id: number;
    name: string;
    email: string;
    status: "confirmed" | "pending";
    registeredAt: string;
  }>>([]);

  // Remove duplicate sendingStatus declaration
  // const [sendingStatus, setSendingStatus] = useState<{
  //   [key: number]: boolean;
  // }>({});

  const generateEmailReminder = async () => {
    setIsGeneratingEmail(true);

    try {
      // Prepare key data for email generation
      const keyData = `Event: ${eventData.name}
Date: ${new Date(eventData.datetime).toLocaleDateString()}
Time: ${new Date(eventData.datetime).toLocaleTimeString()}
Location: ${eventData.location}
Type: ${eventData.eventType}
Description: ${eventData.description || ""}`;

      // Call backend API to generate email
      const generatedEmailContent = await generateEmailBody({
        purpose:
          emailPrompt ||
          `Reminder for ${eventData.eventType}: ${eventData.name}`,
        recipientName: "[Participant Name]", // Will be replaced with actual names when sending
        senderName: "Event Team", // You can make this configurable
        keyData: keyData,
        tone: "professional",
        callToAction:
          "Please confirm your attendance by replying to this email",
        suggestions:
          emailPrompt || "Include event details and any special instructions",
      });

      setGeneratedEmail(generatedEmailContent);
      setIsEditingEmail(true);
    } catch (error) {
      console.error("Failed to generate email:", error);

      // Fallback to template if API fails
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
      setIsEditingEmail(true);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const sendEmailToParticipant = async (participantId: number) => {
    if (!generatedEmail.trim()) {
      showToast("warning", "Email Not Generated", "Please generate an email template first before sending to participants.");
      return;
    }

    const participant = participants.find(p => p.id === participantId);
    if (!participant) {
      showToast("error", "Participant Not Found", "Unable to find the selected participant.");
      return;
    }

    setSendingStatus((prev) => ({ ...prev, [participantId]: true }));

    try {
      // Parse the generated email to extract subject and body
      const parsedEmail = parseEmailContent(generatedEmail);
      
      // Personalize the email body with participant's name
      const personalizedBody = parsedEmail.body.replace(/\[Participant Name\]/g, participant.name);
      
      // Send email to individual participant
      const result = await sendSingleEmail({
        recipientEmail: participant.email,
        subject: parsedEmail.subject,
        body: personalizedBody
      });

      if (result.success) {
        showToast("success", "Email Sent", `Successfully sent email to ${participant.name}!`);
      } else {
        throw new Error(result.message || 'Failed to send email');
      }

    } catch (error) {
      console.error('Failed to send email to participant:', error);
      showToast("error", "Send Failed", `Failed to send email to ${participant.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSendingStatus((prev) => ({ ...prev, [participantId]: false }));
    }
  };

  const sendViaGoogleSheets = async () => {
    if (!sheetId || !generatedEmail) {
      showToast("warning", "Missing Information", "Please provide a Google Sheet ID and generate an email first.");
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

      showToast("success", "Update Sent", "Event update sent successfully via Google Sheets!");
      console.log("Send result:", result);
    } catch (error) {
      console.error("Failed to send via Google Sheets:", error);
      showToast("error", "Send Failed", "Failed to send event update. Please check your Sheet ID and try again.");
    } finally {
      setIsSendingAll(false);
    }
  };

  const sendEmailToAll = async () => {
    if (!generatedEmail.trim()) {
      showToast("warning", "Email Not Generated", "Please generate an email template first before sending to participants.");
      return;
    }

    if (!googleSheetLink.trim()) {
      showToast("warning", "Google Sheet Link Required", "Please provide a Google Sheet link to send emails to participants.");
      return;
    }

    setIsSendingAll(true);

    try {
      // Parse the generated email to extract subject and body
      const parsedEmail = parseEmailContent(generatedEmail);
      
      console.log('Parsed email:', parsedEmail);

      // Send emails to all participants via Google Sheet
      const result = await sendEmailToAllParticipants({
        sheetLink: googleSheetLink,
        emailSubject: parsedEmail.subject,
        emailBody: parsedEmail.body
      });

      if (result.success) {
        showToast("success", "Emails Sent", `Successfully sent emails to all participants! ${result.message || ''}`);
      } else {
        throw new Error(result.message || 'Failed to send emails');
      }

    } catch (error) {
      console.error('Failed to send emails to participants:', error);
      showToast("error", "Send Failed", `Failed to send emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSendingAll(false);
    }
  };

  const regenerateEmail = async () => {
    if (!regenerationSuggestions.trim()) {
      showToast("warning", "Suggestions Required", "Please provide suggestions for regeneration.");
      return;
    }

    setIsGeneratingEmail(true);

    try {
      // Prepare key data for email generation
      const keyData = `Event: ${eventData.name}
Date: ${new Date(eventData.datetime).toLocaleDateString()}
Time: ${new Date(eventData.datetime).toLocaleTimeString()}
Location: ${eventData.location}
Type: ${eventData.eventType}
Description: ${eventData.description || ""}

Previous email was generated. User feedback: ${regenerationSuggestions}`;

      // Call backend API to regenerate email with suggestions
      const generatedEmailContent = await generateEmailBody({
        purpose: `Regenerate email for ${eventData.eventType}: ${eventData.name} with improvements based on user feedback`,
        recipientName: "[Participant Name]",
        senderName: "Event Team",
        keyData: keyData,
        tone: "professional",
        callToAction:
          "Please confirm your attendance by replying to this email",
        suggestions: `Original request: ${
          emailPrompt || "Event reminder email"
        }. User feedback for improvement: ${regenerationSuggestions}`,
      });

      setGeneratedEmail(generatedEmailContent);
      setIsEditingEmail(true);
      setShowRegenerateOptions(false);
      setRegenerationSuggestions("");
    } catch (error) {
      console.error("Failed to regenerate email:", error);
      showToast("error", "Regeneration Failed", "Failed to regenerate email. Please try again.");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const extractParticipantsFromSheet = async () => {
    if (!googleSheetLink.trim()) {
      showToast("warning", "Google Sheet Link Required", "Please provide a Google Sheet link.");
      return;
    }

    setIsExtractingParticipants(true);

    try {
      const extractedContacts = await extractAllContactsFromSheet(googleSheetLink);
      console.log("Extracted contacts:", extractedContacts);
      
      // Convert extracted contacts to participant format
      const newParticipants = extractedContacts.map((contact: Contact, index: number) => ({
        id: Date.now() + index, // Generate unique ID
        name: contact.name,
        email: contact.email,
        status: "pending" as const,
        registeredAt: new Date().toISOString().split('T')[0],
      }));

      setParticipants(newParticipants);
      showToast("success", "Extraction Complete", `Successfully extracted ${newParticipants.length} participants from the Google Sheet!`);
    } catch (error) {
      console.error("Failed to extract participants:", error);
      showToast("error", "Extraction Failed", `Failed to extract participants: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExtractingParticipants(false);
    }
  };

  return (
    <>
      {/* Toast Notifications Container - Upper Middle */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex flex-col items-center pt-4 sm:pt-6 md:pt-8 px-4 space-y-3">
          {toasts.map((toast, index) => (
            <div 
              key={toast.id}
              style={{ 
                transform: `translateY(${index * 10}px)`,
                zIndex: 60 + index 
              }}
              className="pointer-events-auto"
            >
              <Toast
                id={toast.id}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                onClose={removeToast}
              />
            </div>
          ))}
        </div>
      </div>
      
      <Card title="Automated Reminders" icon={<Bell className="h-6 w-6" />}>
      {/* Enhanced Email Reminder Section */}
      <div className="space-y-6">
        {/* Email Generation */}
        <div className="p-6 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-2xl border border-indigo-500/20">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-tomorrow text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-400" />
              Generate Mail (AI Powered)
            </h4>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                SmythOS AI-powered generation
              </span>
            </div>
          </div>

          {/* Email Prompt Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Instructions (Optional)
            </label>
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

              {/* Regenerate Options */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() =>
                    setShowRegenerateOptions(!showRegenerateOptions)
                  }
                  className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border border-yellow-500/30 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate with Suggestions
                </button>

                <button
                  onClick={() => navigator.clipboard.writeText(generatedEmail)}
                  className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 border border-gray-500/30 rounded-lg transition-all duration-200 text-sm"
                >
                  Copy Email
                </button>
              </div>

              {/* Regeneration Suggestions Input */}
              {showRegenerateOptions && (
                <div className="mt-4 p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-xl">
                  <label className="block text-sm font-medium text-yellow-300 mb-2">
                    What would you like to improve or change?
                  </label>
                  <div className="flex gap-3">
                    <textarea
                      value={regenerationSuggestions}
                      onChange={(e) =>
                        setRegenerationSuggestions(e.target.value)
                      }
                      placeholder="e.g., 'Make it more formal', 'Add RSVP deadline', 'Include dress code', 'Make it shorter'"
                      rows={3}
                      className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 resize-none"
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={regenerateEmail}
                        disabled={
                          isGeneratingEmail || !regenerationSuggestions.trim()
                        }
                        className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border border-yellow-500/30 rounded-lg disabled:opacity-50 transition-all duration-200 flex items-center gap-2 text-sm whitespace-nowrap"
                      >
                        {isGeneratingEmail ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {isGeneratingEmail ? "Regenerating..." : "Regenerate"}
                      </button>
                      <button
                        onClick={() => {
                          setShowRegenerateOptions(false);
                          setRegenerationSuggestions("");
                        }}
                        className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 border border-gray-500/30 rounded-lg transition-all duration-200 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Quick Suggestion Buttons */}
                  <div className="mt-3">
                    <div className="text-xs text-yellow-400 mb-2">
                      Quick suggestions:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Make it more formal",
                        "Make it more casual",
                        "Add RSVP deadline",
                        "Include dress code",
                        "Make it shorter",
                        "Add parking info",
                        "Include agenda",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setRegenerationSuggestions(suggestion)}
                          className="px-3 py-1 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-300 border border-yellow-500/20 rounded-md text-xs transition-all duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Google Sheet Participant Extraction */}
        <div className="p-6 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-2xl border border-blue-500/20">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-tomorrow text-white flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-400" />
              Extract Participants from Google Sheet
            </h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Google Sheet Link
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={googleSheetLink}
                  onChange={(e) => setGoogleSheetLink(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/..."
                  className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  onClick={extractParticipantsFromSheet}
                  disabled={isExtractingParticipants || !googleSheetLink.trim()}
                  className="px-6 py-3 bg-blue-600/20 font-tomorrow hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl disabled:opacity-50 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                >
                  {isExtractingParticipants ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isExtractingParticipants ? "Extracting..." : "Extract Data"}
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-400 bg-gray-900/30 border border-gray-600/20 rounded-lg p-3">
              <p className="font-medium text-gray-300 mb-2">Instructions:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Make sure your Google Sheet is publicly accessible or properly shared</li>
                <li>The sheet should contain participant names and email addresses</li>
                <li>Common column headers: Name, Email, Full Name, Email Address, etc.</li>
                <li>After extraction, participants will be added to the list below</li>
              </ul>
            </div>
          </div>
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
              disabled={isSendingAll || !generatedEmail || !googleSheetLink.trim()}
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
                    <p className="text-gray-500 text-xs">
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

          {(!generatedEmail || !googleSheetLink.trim()) && (
            <div className="mt-4 p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl">
              <p className="text-amber-300 text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {!generatedEmail && !googleSheetLink.trim() 
                  ? "Generate an email template and provide a Google Sheet link to send reminders to participants."
                  : !generatedEmail 
                  ? "Generate an email template first to enable sending reminders to participants."
                  : "Provide a Google Sheet link in the section above to send emails to participants."
                }
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl border border-blue-500/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {participants.length}
              </div>
              <div className="text-sm text-gray-400">Total Participants</div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded-xl border border-green-500/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {generatedEmail ? "✓" : "○"}
              </div>
              <div className="text-sm text-gray-400">Email Template</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
    </>
  );
};
