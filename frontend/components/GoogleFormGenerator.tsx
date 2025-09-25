import React, { useState } from "react";
import { useGoogleFormGeneration } from "../services/googleFormApi";
import { Button } from "./ui/Button";

interface GoogleFormGeneratorProps {
  eventId?: string;
  eventName?: string;
  existingFormUrl?: string;
  existingEditUrl?: string;
  onFormGenerated?: (formData: any) => void;
}

export const GoogleFormGenerator: React.FC<GoogleFormGeneratorProps> = ({
  eventId,
  eventName,
  existingFormUrl,
  existingEditUrl,
  onFormGenerated,
}) => {
  const [formTitle, setFormTitle] = useState(
    eventName ? `${eventName} - Registration Form` : ""
  );
  const [formDescription, setFormDescription] = useState("");
  const [editorEmail, setEditorEmail] = useState("");
  const [generatedForm, setGeneratedForm] = useState<any>(null);
  const { generateForm, generateEventForm, isLoading, error } =
    useGoogleFormGeneration();

  // Check if form already exists
  const hasExistingForm = existingFormUrl && existingFormUrl.trim() !== "";

  const handleGenerateForm = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let result;

      if (eventId) {
        // Generate form for specific event
        result = await generateEventForm(eventId, {
          editorEmail: editorEmail || undefined,
        });
      } else {
        // Generate general form
        result = await generateForm({
          formTitle,
          formDescription: formDescription || undefined,
          editorEmail: editorEmail || undefined,
        });
      }

      setGeneratedForm(result);
      onFormGenerated?.(result);
    } catch (err) {
      console.error("Form generation failed:", err);
    }
  };

  // Show existing form if available - no generation options when form exists
  if (hasExistingForm || generatedForm?.success) {
    const formData = generatedForm?.data || {
      formTitle: eventName
        ? `${eventName} - Registration Form`
        : "Registration Form",
      formUrl: existingFormUrl,
      editFormUrl: existingEditUrl,
      instructions: generatedForm?.isExisting
        ? "Form already exists for this event"
        : "Registration form is ready",
    };

    return (
      <div className="bg-green-900/20 border border-green-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-300 mb-4">
          📋 Registration Form Available
        </h3>

        <div className="space-y-4">
          <div>
            <p className="text-white font-medium">{formData.formTitle}</p>
            <p className="text-green-200/80 text-sm mt-1">
              Ready for attendee registration
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.open(formData.formUrl, "_blank")}
              variant="primary"
              label="📝 Open Registration Form"
            />
            {formData.editFormUrl && (
              <Button
                onClick={() => window.open(formData.editFormUrl, "_blank")}
                variant="outline"
                label="✏️ Edit Form"
              />
            )}
          </div>

          <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-400/20 rounded-xl">
            <p className="text-cyan-200 text-sm">
              <strong>📌 Note:</strong> Share the registration form link with
              attendees to collect their information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950/40 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        {eventId ? "Generate Event Registration Form" : "Generate Google Form"}
      </h3>

      <form onSubmit={handleGenerateForm} className="space-y-4">
        {!eventId && (
          <div>
            <label
              htmlFor="formTitle"
              className="block text-sm font-medium text-white mb-1"
            >
              Form Title *
            </label>
            <input
              type="text"
              id="formTitle"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-950/60 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all"
              placeholder="Enter form title..."
            />
          </div>
        )}

        <div>
          <label
            htmlFor="formDescription"
            className="block text-sm font-medium text-white mb-1"
          >
            Form Description
          </label>
          <textarea
            id="formDescription"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-gray-950/60 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all"
            placeholder="Enter form description (optional)..."
          />
        </div>

        <div>
          <label
            htmlFor="editorEmail"
            className="block text-sm font-medium text-white mb-1"
          >
            Editor Email
          </label>
          <input
            type="email"
            id="editorEmail"
            value={editorEmail}
            onChange={(e) => setEditorEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-950/60 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all"
            placeholder="Email for form edit access (optional)..."
          />
          <p className="text-xs text-gray-400 mt-1">
            If not provided, your account email will be used for edit access.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-400/20 rounded-xl p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (!eventId && !formTitle.trim())}
          className="w-full px-4 py-3 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold transition-all"
        >
          {isLoading ? "Generating Form..." : "Generate Google Form"}
        </button>
      </form>

      <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-400/20 rounded-xl">
        <p className="text-cyan-200 text-sm">
          <strong>Note:</strong> The generated form will include fields for
          Name, Email, WhatsApp number, and Telegram username.
        </p>
      </div>
    </div>
  );
};
