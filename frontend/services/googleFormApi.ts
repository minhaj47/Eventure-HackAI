/**
 * Google Form Generation API Service
 * Frontend service for interacting witexport const generateGoogleForm = async (
  formData: GoogleFormRequest
): Promise<GoogleFormResponse> => {
  try {
    const response = await makeApiRequest('/api/event/generate-google-form', {
      method: 'POST',
      body: JSON.stringify(formData),
    });S Google Form generation endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CustomField {
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
  [key: string]: unknown;
}

export interface GoogleFormRequest {
  formTitle: string;
  formDescription?: string;
  editorEmail?: string;
  customFields?: CustomField[];
}

export interface EventRegistrationFormRequest {
  editorEmail?: string;
  forceRegenerate?: boolean;
  customFields?: CustomField[];
}

export interface GoogleFormResponse {
  success: boolean;
  data: {
    formTitle: string;
    formUrl: string;
    editFormUrl: string;
    formId: string;
    instructions: string;
  };
  message: string;
}

export interface EventRegistrationFormResponse extends GoogleFormResponse {
  event: {
    id: string;
    name: string;
    description: string;
  };
  isExisting?: boolean;
}

export interface ConfigurationResponse {
  success: boolean;
  configuration: {
    isValid: boolean;
    issues: string[];
    configuration: {
      endpoint: string;
      requiresApiKey: boolean;
    };
  };
}

/**
 * Make API request with cookie-based authentication
 */
const makeApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Include cookies for authentication
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response;
};

/**
 * Generate a general Google Form
 */
export const generateGoogleForm = async (
  formData: GoogleFormRequest
): Promise<GoogleFormResponse> => {
  console.log("Generating Google Form with data:", formData);
  try {
    const response = await makeApiRequest("/api/event/generate-google-form", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    return await response.json();
  } catch (error) {
    console.error("Error generating Google Form:", error);
    throw error;
  }
};

/**
 * Generate a registration form for a specific event
 */
export const generateEventRegistrationForm = async (
  eventId: string,
  formData: EventRegistrationFormRequest = {}
): Promise<EventRegistrationFormResponse> => {
  try {
    const response = await makeApiRequest(
      `/api/event/${eventId}/generate-registration-form`,
      {
        method: "POST",
        body: JSON.stringify(formData),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error generating event registration form:", error);
    throw error;
  }
};

/**
 * Check Google Form service configuration
 */
export const checkGoogleFormConfig =
  async (): Promise<ConfigurationResponse> => {
    try {
      const response = await makeApiRequest("/api/event/google-form-config");
      return await response.json();
    } catch (error) {
      console.error("Error checking Google Form configuration:", error);
      throw error;
    }
  };

/**
 * React hook for Google Form generation
 */
export const useGoogleFormGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateForm = async (formData: GoogleFormRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateGoogleForm(formData);
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate form";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const generateEventForm = async (
    eventId: string,
    formData: EventRegistrationFormRequest = {}
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateEventRegistrationForm(eventId, formData);
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate event form";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const checkConfig = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await checkGoogleFormConfig();
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check configuration";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    generateForm,
    generateEventForm,
    checkConfig,
    isLoading,
    error,
  };
};

// Import useState for the hook
import { useState } from "react";
