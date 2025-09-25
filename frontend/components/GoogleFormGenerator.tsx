import React, { useState } from 'react';
import { useGoogleFormGeneration } from '../services/googleFormApi';
import { Button } from './ui/Button';

interface GoogleFormGeneratorProps {
  eventId?: string;
  eventName?: string;
  onFormGenerated?: (formData: any) => void;
}

export const GoogleFormGenerator: React.FC<GoogleFormGeneratorProps> = ({
  eventId,
  eventName,
  onFormGenerated
}) => {
  const [formTitle, setFormTitle] = useState(
    eventName ? `${eventName} - Registration Form` : ''
  );
  const [formDescription, setFormDescription] = useState('');
  const [editorEmail, setEditorEmail] = useState('');
  const [generatedForm, setGeneratedForm] = useState<any>(null);

  const { generateForm, generateEventForm, isLoading, error } = useGoogleFormGeneration();

  const handleGenerateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result;
      
      if (eventId) {
        // Generate form for specific event
        result = await generateEventForm(eventId, {
          editorEmail: editorEmail || undefined
        });
      } else {
        // Generate general form
        result = await generateForm({
          formTitle,
          formDescription: formDescription || undefined,
          editorEmail: editorEmail || undefined
        });
      }

      setGeneratedForm(result);
      onFormGenerated?.(result);
    } catch (err) {
      console.error('Form generation failed:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to show a toast notification here
  };

  if (generatedForm?.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">
          ✅ Google Form Created Successfully!
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Title:
            </label>
            <p className="text-gray-900">{generatedForm.data.formTitle}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Public Form URL:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={generatedForm.data.formUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <Button
                onClick={() => copyToClipboard(generatedForm.data.formUrl)}
                variant="outline"
                label="Copy"
              />
              <Button
                onClick={() => window.open(generatedForm.data.formUrl, '_blank')}
                variant="outline"
                label="Open"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edit Form URL:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={generatedForm.data.editFormUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <Button
                onClick={() => copyToClipboard(generatedForm.data.editFormUrl)}
                variant="outline"
                label="Copy"
              />
              <Button
                onClick={() => window.open(generatedForm.data.editFormUrl, '_blank')}
                variant="outline"
                label="Edit"
              />
            </div>
          </div>

          {generatedForm.data.instructions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions:
              </label>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
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
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {eventId ? 'Generate Event Registration Form' : 'Generate Google Form'}
      </h3>

      <form onSubmit={handleGenerateForm} className="space-y-4">
        {!eventId && (
          <div>
            <label htmlFor="formTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Form Title *
            </label>
            <input
              type="text"
              id="formTitle"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter form title..."
            />
          </div>
        )}

        <div>
          <label htmlFor="formDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Form Description
          </label>
          <textarea
            id="formDescription"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter form description (optional)..."
          />
        </div>

        <div>
          <label htmlFor="editorEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Editor Email
          </label>
          <input
            type="email"
            id="editorEmail"
            value={editorEmail}
            onChange={(e) => setEditorEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email for form edit access (optional)..."
          />
          <p className="text-xs text-gray-500 mt-1">
            If not provided, your account email will be used for edit access.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (!eventId && !formTitle.trim())}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating Form...' : 'Generate Google Form'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> The generated form will include fields for Name, Email, WhatsApp number, and Telegram username.
        </p>
      </div>
    </div>
  );
};
