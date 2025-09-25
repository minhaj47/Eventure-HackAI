const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface EmailGenerationRequest {
  purpose: string;
  recipientName?: string;
  senderName?: string;
  keyData: string;
  tone?: string;
  callToAction?: string;
  suggestions?: string;
}

export const generateEmailBody = async (
  data: EmailGenerationRequest
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate_email_body`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to generate email: ${response.statusText}`
      );
    }

    // Try to parse as JSON first (SmythOS API format)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const jsonResponse = await response.json();
      console.log("API Response:", jsonResponse); // Debug logging

      // Handle SmythOS API response format
      if (jsonResponse.result?.Output?.emailBody) {
        const subject = jsonResponse.result.Output.subject || "";
        let body = jsonResponse.result.Output.emailBody || "";

        // Replace template variables with placeholders or actual values
        body = body.replace(/\{\{recipientName\}\}/g, "[Recipient Name]");
        body = body.replace(
          /\{\{senderName\}\}/g,
          data.senderName || "[Sender Name]"
        );

        // Combine subject and body for a complete email
        return subject ? `Subject: ${subject}\n\n${body}` : body;
      }

      // Fallback for other JSON formats
      if (typeof jsonResponse === "string") {
        return jsonResponse;
      }

      // Try to find email content in other possible locations
      if (jsonResponse.emailBody) {
        return jsonResponse.emailBody;
      }

      if (jsonResponse.data?.emailBody) {
        return jsonResponse.data.emailBody;
      }

      // If it's an object, try to extract meaningful content
      console.warn("Unexpected API response format:", jsonResponse);
      return `API Response (unexpected format):\n${JSON.stringify(
        jsonResponse,
        null,
        2
      )}`;
    } else {
      // Fallback to plain text
      const emailContent = await response.text();
      return emailContent;
    }
  } catch (error) {
    console.error("Error generating email:", error);

    // Add more context for debugging
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to backend at ${API_BASE_URL}. Please ensure the backend server is running.`
      );
    }

    throw error;
  }
};
