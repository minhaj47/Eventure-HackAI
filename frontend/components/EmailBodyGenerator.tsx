import { Edit3, Mail, RefreshCw, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { generateEmailBody } from "../services/apiService";
import { Card, Toast, useToast } from "./ui";

interface EmailBodyGeneratorProps {
  eventData: {
    name: string;
    eventType: string;
    datetime: string;
    location: string;
    description: string;
  };
}

export const EmailBodyGenerator: React.FC<EmailBodyGeneratorProps> = ({
  eventData,
}) => {
  // Toast notifications
  const { toasts, showToast, removeToast } = useToast();

  const [emailPrompt, setEmailPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tone, setTone] = useState<"professional" | "casual" | "formal">(
    "professional"
  );

  // Regeneration states
  const [regenerationSuggestions, setRegenerationSuggestions] = useState("");
  const [showRegenerateOptions, setShowRegenerateOptions] = useState(false);

  const generateEmail = async () => {
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
          emailPrompt || `Email for ${eventData.eventType}: ${eventData.name}`,
        recipientName: "[Recipient Name]", // Will be replaced with actual names when sending
        senderName: "Event Team", // You can make this configurable
        keyData: keyData,
        tone: tone,
        callToAction:
          "Please confirm your attendance or contact us for more information",
        suggestions:
          emailPrompt || "Include event details and important information",
      });

      setGeneratedEmail(generatedEmailContent);
      setIsEditingEmail(true);
    } catch (error) {
      console.error("Failed to generate email:", error);

      // Fallback to template if API fails
      const fallbackEmail = `Subject: ${eventData.name} - Event Information

Dear [Recipient Name],

We are pleased to invite you to ${eventData.name}, a ${
        eventData.eventType
      } that promises to be an enriching experience.

Event Details:
📅 Date: ${new Date(eventData.datetime).toLocaleDateString()}
🕒 Time: ${new Date(eventData.datetime).toLocaleTimeString()}
📍 Location: ${eventData.location}

${
  eventData.description ||
  "This event will provide valuable insights and networking opportunities."
}

Please mark your calendar and let us know if you plan to attend. We look forward to seeing you there!

Best regards,
The Event Team

---
Questions? Contact us at: events@company.com`;

      setGeneratedEmail(fallbackEmail);
      setIsEditingEmail(true);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      // You could add a toast notification here
      console.log("Email copied to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
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
        recipientName: "[Recipient Name]",
        senderName: "Event Team",
        keyData: keyData,
        tone: tone,
        callToAction:
          "Please confirm your attendance or contact us for more information",
        suggestions: `Original request: ${
          emailPrompt || "Event email"
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

  return (
    <>
      {/* Toast Notifications Container */}
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
      
      <Card title="Email Body Generator" icon={<Mail className="h-6 w-6" />}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Email Purpose/Prompt
            </label>
            <input
              type="text"
              value={emailPrompt}
              onChange={(e) => setEmailPrompt(e.target.value)}
              placeholder="e.g., 'Invitation email with parking instructions'"
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Email Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as "professional" | "casual" | "formal")}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-3">
          <button
            onClick={generateEmail}
            disabled={isGeneratingEmail}
            className="flex-1 px-6 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isGeneratingEmail ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGeneratingEmail ? "Generating..." : "Generate Email"}
          </button>
        </div>

        {/* Generated Email Display */}
        {generatedEmail && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Generated Email
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingEmail(!isEditingEmail)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Edit3 className="h-3 w-3" />
                  {isEditingEmail ? "View Mode" : "Edit Mode"}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-green-400 hover:text-green-300 px-2 py-1 bg-green-900/20 rounded"
                >
                  Copy
                </button>
              </div>
            </div>
            {isEditingEmail ? (
              <textarea
                value={generatedEmail}
                onChange={(e) => setGeneratedEmail(e.target.value)}
                rows={16}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-xl text-gray-300 font-mono text-sm leading-relaxed focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 resize-none"
              />
            ) : (
              <div className="bg-gray-900/50 border border-gray-600/30 rounded-xl p-4 text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                {generatedEmail}
              </div>
            )}

            {/* Regenerate Options */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowRegenerateOptions(!showRegenerateOptions)}
                className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border border-yellow-500/30 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate with Suggestions
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
                    onChange={(e) => setRegenerationSuggestions(e.target.value)}
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
                      "Add contact details",
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
    </Card>
    </>
  );
};
