import React, { useState } from "react";
import { useGoogleFormGeneration } from "../services/googleFormApi";
import { Button } from "./ui/Button";

interface GoogleFormGeneratorProps {
  eventId?: string;
  eventName?: string;
  existingFormUrl?: string;
  existingEditUrl?: string;
  onFormGenerated?: (formData: { formTitle: string; formUrl: string; editFormUrl: string; formId: string; instructions: string; }) => void;
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
  const [generatedForm, setGeneratedForm] = useState<{ success: boolean; data: any[]; isExisting?: boolean; } | null>(null);
  const { generateForm, generateEventForm, isLoading, error } =
    useGoogleFormGeneration();

  // Check if form already exists
  const hasExistingForm = existingFormUrl && existingFormUrl.trim() !== "";

  const handleGenerateForm = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let result;
      console.log(eventId);
      if (eventId) {
        console.log("Generating event form");
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
      console.log("API Result:", result);
      setGeneratedForm(result);
      onFormGenerated?.(result);
    } catch (err) {
      console.error("Form generation failed:", err);
    }
  };

  // Show existing form if available - no generation options when form exists
  if (hasExistingForm || generatedForm?.success) {
    // Extract form data from the correct structure
    let formData;
    
    if (generatedForm?.success && generatedForm.data?.length > 0) {
      // Find the APIOutput result in the data array
      const outputResult = generatedForm.data.find((item: { name: string; result?: any }) => 
        item.name === "APIOutput"
      );
      
      console.log("Output Result:", outputResult);
      console.log("Result structure:", outputResult?.result);
      console.log("Output structure:", outputResult?.result?.Output);
      console.log("FormDetails structure:", outputResult?.result?.Output?.formDetails);
      
      if (outputResult?.result?.Output?.formDetails) {
        // The form details are nested in result.Output.formDetails
        const formDetails = outputResult.result.Output.formDetails;
        formData = {
          formTitle: formDetails.formTitle || (eventName ? `${eventName} - Registration Form` : "Registration Form"),
          formUrl: formDetails.formUrl,
          editFormUrl: formDetails.editFormUrl,
          instructions: formDetails.instructions,
          formId: formDetails.formId,
        };
        
        console.log("Extracted form data:", formData);
      } else if (outputResult?.result) {
        // Fallback: try to access directly from result
        const result = outputResult.result;
        formData = {
          formTitle: result.formTitle || (eventName ? `${eventName} - Registration Form` : "Registration Form"),
          formUrl: result.formUrl,
          editFormUrl: result.editFormUrl,
          instructions: result.instructions,
          formId: result.formId,
        };
        
        console.log("Extracted form data (fallback):", formData);
      }
    }
    
    // Fallback to existing form data if no generated form
    if (!formData) {
      formData = {
        formTitle: eventName
          ? `${eventName} - Registration Form`
          : "Registration Form",
        formUrl: existingFormUrl,
        editFormUrl: existingEditUrl,
        instructions: generatedForm?.isExisting
          ? "Form already exists for this event"
          : "Registration form is ready",
      };
    }

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
            {formData.formUrl && (
              <Button
                onClick={() => window.open(formData.formUrl, "_blank")}
                variant="primary"
                label="📝 Open Registration Form"
              />
            )}
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
          <div className="bg-red-900/20 border border-red-400/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <span className="text-red-400 text-lg">⚠️</span>
              <div className="flex-1">
                <h4 className="text-red-300 font-medium mb-2">Form Generation Failed</h4>
                <p className="text-red-200 text-sm mb-3">{error}</p>
                {(error.includes('timeout') || error.includes('unavailable') || error.includes('connection')) && (
                  <div className="space-y-2">
                    <p className="text-red-200 text-xs">
                      This is usually a temporary issue. The external form service may be busy.
                    </p>
                    <button
                      onClick={() => handleGenerateForm({ preventDefault: () => {} } as React.FormEvent)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
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
          Name, Email, WhatsApp number, and optional Telegram username.
        </p>
      </div>
    </div>
  );
};