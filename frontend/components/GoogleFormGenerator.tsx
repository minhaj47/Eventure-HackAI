import React, { useState } from "react";
import { useGoogleFormGeneration } from "../services/googleFormApi";
import { Button } from "./ui/Button";

interface GoogleFormGeneratorProps {
  eventId?: string;
  eventName?: string;
  onFormGenerated?: (formData: any) => void;
}

export const GoogleFormGenerator: React.FC<GoogleFormGeneratorProps> = ({
  eventId,
  eventName,
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to show a toast notification here
  };

  if (generatedForm?.success) {
    return (
      <div className="bg-green-900/20 border border-green-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-300 mb-4">
          ✅ Google Form Created Successfully!
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-200 mb-1">
              Form Title:
            </label>
            <p className="text-white">{generatedForm.data.formTitle}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-green-200 mb-1">
              Public Form URL:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={generatedForm.data.formUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-white/20 rounded-md bg-gray-950/60 text-white text-sm"
              />
              <Button
                onClick={() => copyToClipboard(generatedForm.data.formUrl)}
                variant="outline"
                label="Copy"
              />
              <Button
                onClick={() =>
                  window.open(generatedForm.data.formUrl, "_blank")
                }
                variant="outline"
                label="Open"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-green-200 mb-1">
              Edit Form URL:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={generatedForm.data.editFormUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-white/20 rounded-md bg-gray-950/60 text-white text-sm"
              />
              <Button
                onClick={() => copyToClipboard(generatedForm.data.editFormUrl)}
                variant="outline"
                label="Copy"
              />
              <Button
                onClick={() =>
                  window.open(generatedForm.data.editFormUrl, "_blank")
                }
                variant="outline"
                label="Edit"
              />
            </div>
          </div>

          {generatedForm.data.instructions && (
            <div>
              <label className="block text-sm font-medium text-green-200 mb-1">
                Instructions:
              </label>
              <p className="text-white/90 text-sm bg-gray-950/40 p-3 rounded-xl border border-white/10">
                {generatedForm.data.instructions}
              </p>
            </div>
          )}

          <Button
            onClick={() => setGeneratedForm(null)}
            variant="outline"
            label="Generate Another Form"
          />
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
