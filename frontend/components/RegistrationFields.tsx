import { ExternalLink, Minus, Plus, Users } from "lucide-react";
import React, { useState, useEffect } from "react";
import { EventData, RegistrationField } from "../types";
import { GoogleFormGenerator } from "./GoogleFormGenerator";
import { useGoogleFormGeneration, CustomField } from "../services/googleFormApi";
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
  onFormGenerated?: () => void;
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
  onFormGenerated,
}) => {
  const [showGoogleFormGenerator, setShowGoogleFormGenerator] = useState(false);
  const [generatedFormData, setGeneratedFormData] = useState<{
    success?: boolean;
    data?: {
      formTitle: string;
      formUrl: string;
      editFormUrl: string;
      formId: string;
      instructions: string;
    };
  } | null>(null);
  
  // State for managing custom fields for Google Form generation
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { type: 'text', label: 'Full Name', required: true },
    { type: 'email', label: 'Email Address', required: true },
    { type: 'text', label: 'WhatsApp Number', required: false },
    { type: 'text', label: 'Organization', required: false }
  ]);
  
  const { generateForm, generateEventForm, isLoading, error } = useGoogleFormGeneration();

  // Handle Google Form generation
  const handleGenerateGoogleForm = async () => {
    // Check if a form already exists
    if (hasExistingForm) {
      console.log("Form already exists - not generating a new one");
      return;
    }

    try {
      let result;
      
      if (eventId) {
        console.log("=== GENERATING EVENT FORM ===");
        console.log("Event ID:", eventId);
        console.log("Request payload:", {
          editorEmail: undefined,
          customFields: customFields
        });
        console.log("Custom Fields for Event Form:");
        customFields.forEach((field, index) => {
          console.log(`  ${index + 1}. ${field.label} (${field.type}) - ${field.required ? 'Required' : 'Optional'}`);
        });
        
        result = await generateEventForm(eventId, {
          editorEmail: undefined, // Will use current user's email
          customFields: customFields, // Pass custom fields for event forms
        });
      } else {
        // Generate general form with current fields (default + custom)
        const formTitle = eventData?.eventName ? `${eventData.eventName} - Registration Form` : "Event Registration Form";
        const formDescription = `Please register for ${eventData?.eventName || 'this event'}. Fill out the required information below to confirm your attendance.`;
        
        console.log("=== GENERATING GENERAL FORM ===");
        console.log("Request payload:", {
          formTitle,
          formDescription,
          editorEmail: undefined,
          customFields: customFields
        });
        console.log("Custom Fields Details for General Form:");
        customFields.forEach((field, index) => {
          console.log(`  ${index + 1}. ${field.label} (${field.type}) - ${field.required ? 'Required' : 'Optional'}`);
        });
        
        result = await generateForm({
          formTitle,
          formDescription,
          editorEmail: undefined, // Will use current user's email
          customFields: customFields, // Use the fields from state (includes defaults)
        });
      }
      
      console.log("=== GOOGLE FORM GENERATION RESULT ===");
      console.log("Full API Result:", JSON.stringify(result, null, 2));
      
      // Handle the backend response format
      if (result.success && result.data) {
        // Extract form data from backend response
        const formData = {
          formTitle: result.data.formTitle || (eventData?.eventName ? `${eventData.eventName} - Registration Form` : "Registration Form"),
          formUrl: result.data.formUrl,
          editFormUrl: result.data.editFormUrl,
          formId: result.data.formId,
          instructions: result.data.instructions || 'Form generated successfully'
        };
        
        console.log("Processed form data:", formData);
        
        // Validate that we have the required URLs
        if (formData.formUrl && formData.editFormUrl) {
          setGeneratedFormData({
            success: true,
            data: formData
          });
          
          // For event forms, the backend automatically updates the event in the database
          // The URLs are stored in event.registrationFormUrl and event.registrationFormEditUrl
          console.log("✅ Form generation completed successfully");
          console.log("📋 Form URL:", formData.formUrl);
          console.log("✏️ Edit URL:", formData.editFormUrl);
          
          if (eventId) {
            console.log("💾 Form URLs have been saved to database for event:", eventId);
            // Notify parent component that form was generated
            onFormGenerated?.();
            // Force hide the generator since we have a form now
            setShowGoogleFormGenerator(false);
          }
        } else {
          console.error("❌ Form generation incomplete - missing URLs");
          console.error("Form URL:", formData.formUrl);
          console.error("Edit URL:", formData.editFormUrl);
          
          // Set error state for user feedback
          if (!formData.formUrl && !formData.editFormUrl) {
            console.error("Both form URLs are missing - this indicates a serious API issue");
          }
        }
      } else {
        console.error("❌ Form generation failed - no success or data in response");
        console.error("Result success:", result?.success);
        console.error("Result data:", result?.data);
      }
    } catch (err) {
      console.error("Form generation failed:", err);
    }
  };

  // Check if event already has a registration form or if one was just generated
  const hasExistingForm =
    (eventData?.registrationFormUrl && eventData.registrationFormUrl.trim() !== "") ||
    (generatedFormData?.success && generatedFormData?.data);

  // Reset showGoogleFormGenerator when there's an existing form
  useEffect(() => {
    console.log('=== useEffect TRIGGERED ===');
    console.log('hasExistingForm:', hasExistingForm);
    console.log('showGoogleFormGenerator:', showGoogleFormGenerator);
    
    if (hasExistingForm && showGoogleFormGenerator) {
      console.log('🔄 Resetting showGoogleFormGenerator to false');
      setShowGoogleFormGenerator(false);
    }
  }, [hasExistingForm, showGoogleFormGenerator]);

  // Debug logging
  console.log('=== REGISTRATION FIELDS COMPONENT ===');
  console.log('Event Data:', eventData);
  console.log('Registration Form URL:', eventData?.registrationFormUrl);
  console.log('Edit Form URL:', eventData?.registrationFormEditUrl);
  console.log('Generated Form Data:', generatedFormData);
  console.log('Has Existing Form:', hasExistingForm);
  console.log('Show Google Form Generator:', showGoogleFormGenerator);
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
      formData = {
        formUrl: responseData.formUrl,
        editFormUrl: responseData.editFormUrl,
        formTitle: responseData.formTitle || (eventData?.eventName ? `${eventData.eventName} - Registration Form` : "Registration Form")
      };
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

  if (showGoogleFormGenerator && !hasExistingForm) {
    return (
      <Card title="Generate Google Form" icon={<Users className="h-6 w-6" />}>
        <GoogleFormGenerator
          eventId={eventId}
          eventName={eventData?.eventName}
          existingFormUrl={eventData?.registrationFormUrl}
          existingEditUrl={eventData?.registrationFormEditUrl}
          onFormGenerated={(formData) => {
            console.log("=== FORM GENERATED VIA GOOGLE FORM GENERATOR ===");
            console.log("Form data received:", formData);
            
            // The GoogleFormGenerator already handles the backend integration
            // We just need to update our local state to show the generated form
            if (formData && (formData.formUrl || formData.editFormUrl)) {
              setGeneratedFormData({
                success: true,
                data: {
                  formTitle: formData.formTitle || (eventData?.eventName ? `${eventData.eventName} - Registration Form` : "Registration Form"),
                  formUrl: formData.formUrl,
                  editFormUrl: formData.editFormUrl,
                  formId: formData.formId || '',
                  instructions: formData.instructions || 'Form generated successfully'
                }
              });
            }
            
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
        Customize attendee data collection for Google Form
      </p>
      
      {/* Custom Fields Management for Google Form */}
      <div className="space-y-4 mb-8">
        {customFields.map((field, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-950/40 p-4 rounded-xl border border-white/10 hover:border-white/30 transition-all"
          >
            <div className="flex items-center space-x-4">
              <span className="text-base font-medium text-white">
                {field.label}
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
                onClick={() => {
                  const updated = [...customFields];
                  updated[index].required = !updated[index].required;
                  setCustomFields(updated);
                }}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-mono px-2 py-1 rounded border border-cyan-400/30 hover:border-cyan-300/50 transition-all"
              >
                Toggle
              </button>
              <button
                onClick={() => {
                  const updated = customFields.filter((_, i) => i !== index);
                  setCustomFields(updated);
                }}
                className="text-red-400 hover:text-red-300 p-2 rounded border border-red-400/30 hover:border-red-300/50 transition-all"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Field */}
      <div className="flex space-x-4 mb-8">
        <input
          type="text"
          placeholder="New field name..."
          className="flex-1 px-4 py-3 bg-gray-950/60 border border-white/20 rounded-xl text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all"
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
        <Button
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
          icon={<Plus className="h-4 w-4" />}
          label="Add Field"
          variant="outline"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-400/20 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-red-400 text-lg">⚠️</span>
            <div className="flex-1">
              <h4 className="text-red-300 font-medium mb-2">Form Generation Failed</h4>
              <p className="text-red-200 text-sm mb-3">{error}</p>
              <button
                onClick={() => handleGenerateGoogleForm()}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Google Form Buttons */}
      <div className="flex justify-center space-x-4 pb-5">
        <Button
          onClick={hasExistingForm ? () => {} : handleGenerateGoogleForm}
          label={
            hasExistingForm 
              ? "Form Already Exists" 
              : isLoading 
                ? "Generating..." 
                : "Quick Generate Form"
          }
          icon={
            hasExistingForm
              ? <ExternalLink className="h-4 w-4" />
              : isLoading 
                ? <span className="animate-spin">⏳</span> 
                : <ExternalLink className="h-4 w-4" />
          }
          variant={hasExistingForm ? "secondary" : "outline"}
          loading={isLoading && !hasExistingForm}
        />
      </div>

      {/* Show generated form output if available */}
      {generatedFormData?.success && generatedFormData?.data && (
        <div className="mt-6">
          <div className="mb-4 p-3 bg-green-900/20 border border-green-400/20 rounded-lg">
            <p className="text-green-300 text-sm">
              ✅ <strong>Form Generated Successfully!</strong> The form URLs have been automatically saved to the database.
            </p>
          </div>
          <GoogleFormGenerator
            eventName={eventData?.eventName}
            existingFormUrl={generatedFormData.data.formUrl}
            existingEditUrl={generatedFormData.data.editFormUrl}
          />
        </div>
      )}



      {/* 
    <div className="p-6 bg-cyan-500/10 rounded-xl border border-cyan-400/20 text-base text-cyan-200">
      💡 Form auto-sends confirmations & reminders. No setup needed.
    </div> */}
    </Card>
  );
};
