import { ExternalLink, Minus, Plus, Users } from "lucide-react";
import React, { useState } from "react";
import { EventData, RegistrationField } from "../types";
import { GoogleFormGenerator } from "./GoogleFormGenerator";
import { Button, Card } from "./ui";

interface RegistrationFieldsProps {
  registrationFields: RegistrationField[];
  newFieldName: string;
  onNewFieldNameChange: (value: string) => void;
  onAddField: () => void;
  onRemoveField: (id: number) => void;
  onToggleRequired: (id: number) => void;
  eventData?: EventData;
  eventId?: string;
}

export const RegistrationFields: React.FC<RegistrationFieldsProps> = ({
  registrationFields,
  newFieldName,
  onNewFieldNameChange,
  onAddField,
  onRemoveField,
  onToggleRequired,
  eventData,
  eventId,
}) => {
  const [showGoogleFormGenerator, setShowGoogleFormGenerator] = useState(false);
  const [generatedFormData, setGeneratedFormData] = useState<{
    success?: boolean;
    data?: Array<{ name: string; result?: { Output?: { formDetails?: { formUrl?: string; editFormUrl?: string; formTitle?: string } } } }>;
  } | null>(null);



  // Check if event already has a registration form or if one was just generated
  const hasExistingForm =
    (eventData?.registrationFormUrl && eventData.registrationFormUrl.trim() !== "") ||
    (generatedFormData?.success && generatedFormData?.data);

  // Debug logging
  console.log('=== REGISTRATION FIELDS COMPONENT ===');
  console.log('Event Data:', eventData);
  console.log('Registration Form URL:', eventData?.registrationFormUrl);
  console.log('Edit Form URL:', eventData?.registrationFormEditUrl);
  console.log('Has Existing Form:', hasExistingForm);
  console.log('Event ID:', eventId);

  // If there's an existing form or a newly generated form, show it directly
  if (hasExistingForm) {
    console.log('=== SHOWING EXISTING FORM INTERFACE ===');
    
    // Determine form data source (existing event data or newly generated data)
    let formData;
    if (eventData?.registrationFormUrl) {
      // Use existing form data from eventData
      formData = {
        formUrl: eventData.registrationFormUrl,
        editFormUrl: eventData.registrationFormEditUrl,
        formTitle: eventData.eventName ? `${eventData.eventName} - Registration Form` : "Registration Form"
      };
    } else if (generatedFormData?.success && generatedFormData?.data) {
      // Extract form data from generated form response
      const responseData = generatedFormData.data;
      
      // Handle different response formats
      if (Array.isArray(responseData)) {
        // Original SmythOS array format
        const outputResult = responseData.find((item: { name: string; result?: unknown }) => 
          item.name === "APIOutput"
        );
        
        if (outputResult?.result?.Output?.formDetails) {
          const formDetails = outputResult.result.Output.formDetails;
          formData = {
            formUrl: formDetails.formUrl,
            editFormUrl: formDetails.editFormUrl,
            formTitle: formDetails.formTitle || (eventData?.eventName ? `${eventData.eventName} - Registration Form` : "Registration Form")
          };
        }
      } else if (responseData && typeof responseData === 'object') {
        // Direct object format (from mock service or simplified SmythOS response)
        const formResponse = responseData as { formUrl?: string; editFormUrl?: string; formTitle?: string };
        formData = {
          formUrl: formResponse.formUrl,
          editFormUrl: formResponse.editFormUrl,
          formTitle: formResponse.formTitle || (eventData?.eventName ? `${eventData.eventName} - Registration Form` : "Registration Form")
        };
      }
    }

    if (!formData) {
      console.log('No form data available');
      return null;
    }

    return (
      <Card title="Registration Form" icon={<Users className="h-6 w-6" />}>
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
                  label="📝 Open Registration Form"
                  variant="primary"
                />
              )}
              {formData.editFormUrl && (
                <Button
                  onClick={() => window.open(formData.editFormUrl, "_blank")}
                  label="✏️ Edit Form"
                  variant="outline"
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
      </Card>
    );
  }

  if (showGoogleFormGenerator) {
    return (
      <Card title="Generate Google Form" icon={<Users className="h-6 w-6" />}>
        <GoogleFormGenerator
          eventId={eventId}
          eventName={eventData?.eventName}
          existingFormUrl={eventData?.registrationFormUrl}
          existingEditUrl={eventData?.registrationFormEditUrl}
          onFormGenerated={(formData) => {
            setGeneratedFormData(formData);
            setShowGoogleFormGenerator(false); // Hide generator after form creation
            // The component will re-render and show the final interface
            // because hasExistingForm will be true after form generation
          }}
        />
      </Card>
    );
  }

  return (
    <Card title="Registration Fields" icon={<Users className="h-6 w-6" />}>
      <p className="text-gray-400 text-center text-lg mb-8 font-light">
        Customize attendee data collection
      </p>
      <div className="space-y-4 mb-8">
        {registrationFields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between bg-gray-950/40 p-4 rounded-xl border border-white/10 hover:border-white/30 transition-all"
          >
            <div className="flex items-center space-x-4">
              <span className="text-base font-medium text-white">
                {field.name}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono ${
                  field.required
                    ? "bg-red-500/20 text-red-300"
                    : "bg-gray-500/20 text-gray-300"
                }`}
              >
                {field.required ? "Required" : "Optional"}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onToggleRequired(field.id)}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-mono px-2 py-1 rounded border border-cyan-400/30 hover:border-cyan-300/50 transition-all"
              >
                Toggle
              </button>
              <button
                onClick={() => onRemoveField(field.id)}
                className="text-red-400 hover:text-red-300 p-2 rounded border border-red-400/30 hover:border-red-300/50 transition-all"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-4 mb-8">
        <input
          type="text"
          value={newFieldName}
          onChange={(e) => onNewFieldNameChange(e.target.value)}
          placeholder="New field name..."
          className="flex-1 px-4 py-3 bg-gray-950/60 border border-white/20 rounded-xl text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all"
        />
        <Button
          onClick={onAddField}
          icon={<Plus className="h-4 w-4" />}
          label="Add Field"
          variant="outline"
        />
      </div>

      <div className="flex justify-center pb-5">
        <Button
          onClick={() => setShowGoogleFormGenerator(true)}
          label="Generate Google Registration Form"
          icon={<ExternalLink className="h-4 w-4" />}
          variant="outline"
        />
      </div>



      {/* 
    <div className="p-6 bg-cyan-500/10 rounded-xl border border-cyan-400/20 text-base text-cyan-200">
      💡 Form auto-sends confirmations & reminders. No setup needed.
    </div> */}
    </Card>
  );
};
