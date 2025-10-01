import React, { useState } from "react";
import { useGoogleFormGeneration, CustomField } from "../services/googleFormApi";
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
  // Auto-generate form title and description
  const getFormTitle = () => eventName ? `${eventName} - Registration Form` : "Event Registration Form";
  const getFormDescription = () => `Please register for ${eventName || 'this event'}. Fill out the required information below to confirm your attendance.`;
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [generatedForm, setGeneratedForm] = useState<any>(null);
  const { generateForm, generateEventForm, isLoading, error } =
    useGoogleFormGeneration();

  // Check if form already exists
  const hasExistingForm = existingFormUrl && existingFormUrl.trim() !== "";

  const handleGenerateForm = async () => {
    try {
      let result;
      
      if (eventId) {
        console.log("Generating event form");
        // Generate form for specific event
        result = await generateEventForm(eventId, {
          editorEmail: undefined, // Will use current user's email
        });
      } else {
        // Default registration fields
        const defaultFields = [
          { type: 'text', label: 'Full Name', required: true },
          { type: 'email', label: 'Email Address', required: true },
          { type: 'text', label: 'WhatsApp Number', required: false },
          { type: 'text', label: 'Organization', required: false }
        ];

        // Combine default fields with any custom fields
        const allFields = [...defaultFields, ...customFields];

        // Generate general form with auto-generated details
        result = await generateForm({
          formTitle: getFormTitle(),
          formDescription: getFormDescription(),
          editorEmail: undefined, // Will use current user's email
          customFields: allFields,
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
      const outputResult = generatedForm.data.find((item: any) => 
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
      <div className="flex items-center mb-6">
        <span className="text-cyan-400 mr-3 text-2xl">👥</span>
        <div>
          <h3 className="text-xl font-bold text-white">Registration Fields</h3>
          <p className="text-sm text-gray-400">Customize attendee data collection</p>
        </div>
      </div>

      {/* Auto-generated form info */}
      <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <span className="text-cyan-400 text-lg">ℹ️</span>
          <div>
            <p className="text-cyan-200 text-sm">
              <strong>Auto-Generated:</strong> Form title and description will be created automatically based on your event. 
              Editor permissions will be granted to your account.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">

        {/* Registration Fields Section */}
        <div>
          <div className="flex items-center mb-3">
            <span className="text-cyan-400 mr-2">�</span>
            <label className="block text-lg font-medium text-white">
              Registration Fields
            </label>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">
            Customize attendee data collection
          </p>

      {/* Clean Field List */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-800/40 border border-white/10 rounded-lg">
          <span className="text-white">Full Name</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded">Required</span>
            <button className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded transition-colors">
              Toggle
            </button>
            <button className="px-2 py-1 text-red-400 hover:text-red-300 text-sm">
              −
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-800/40 border border-white/10 rounded-lg">
          <span className="text-white">Email Address</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded">Required</span>
            <button className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded transition-colors">
              Toggle
            </button>
            <button className="px-2 py-1 text-red-400 hover:text-red-300 text-sm">
              −
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-800/40 border border-white/10 rounded-lg">
          <span className="text-white">WhatsApp Number</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-gray-700/30 text-gray-300 px-2 py-1 rounded">Optional</span>
            <button className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded transition-colors">
              Toggle
            </button>
            <button className="px-2 py-1 text-red-400 hover:text-red-300 text-sm">
              −
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-800/40 border border-white/10 rounded-lg">
          <span className="text-white">Organization</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-gray-700/30 text-gray-300 px-2 py-1 rounded">Optional</span>
            <button className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded transition-colors">
              Toggle
            </button>
            <button className="px-2 py-1 text-red-400 hover:text-red-300 text-sm">
              −
            </button>
          </div>
        </div>
      </div>

          {/* Custom fields section */}
          {customFields.map((field, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-900/40 rounded-lg mb-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => {
                    const updated = [...customFields];
                    updated[index].label = e.target.value;
                    setCustomFields(updated);
                  }}
                  placeholder="Field label"
                  className="w-full px-3 py-2 bg-gray-800 border border-white/20 rounded-md text-white text-sm"
                />
              </div>
              <select
                value={field.type}
                onChange={(e) => {
                  const updated = [...customFields];
                  updated[index].type = e.target.value;
                  setCustomFields(updated);
                }}
                className="px-3 py-2 bg-gray-800 border border-white/20 rounded-md text-white text-sm"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
              </select>
              <label className="flex items-center text-white text-sm whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={field.required || false}
                  onChange={(e) => {
                    const updated = [...customFields];
                    updated[index].required = e.target.checked;
                    setCustomFields(updated);
                  }}
                  className="mr-2"
                />
                Required
              </label>
              <button
                type="button"
                onClick={() => {
                  const updated = customFields.filter((_, i) => i !== index);
                  setCustomFields(updated);
                }}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          
      {/* Add New Field */}
      <div className="flex items-center space-x-3 mb-8">
        <input
          type="text"
          placeholder="New field name..."
          className="flex-1 px-4 py-3 bg-gray-800/40 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent outline-none transition-all"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              setCustomFields([...customFields, { 
                type: 'text', 
                label: e.currentTarget.value.trim(), 
                required: false 
              }]);
              e.currentTarget.value = '';
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            const input = document.querySelector('input[placeholder="New field name..."]') as HTMLInputElement;
            if (input && input.value.trim()) {
              setCustomFields([...customFields, { 
                type: 'text', 
                label: input.value.trim(), 
                required: false 
              }]);
              input.value = '';
            }
          }}
          className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
        >
          + Add Field
        </button>
      </div>
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
                      onClick={() => handleGenerateForm()}
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

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerateForm}
          disabled={isLoading}
          className="px-6 py-3 bg-transparent border border-cyan-400 text-cyan-300 rounded-lg hover:bg-cyan-400 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>📝</span>
              <span>Generate Google Registration Form</span>
            </>
          )}
        </button>
      </div>
    </div>

  );
};