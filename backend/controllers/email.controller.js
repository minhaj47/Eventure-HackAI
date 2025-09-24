import axios from "axios";

export const generateEmailBody = async (req, res) => {
  try {
    const {
      purpose,
      recipientName,
      senderName,
      keyData,
      tone = "professional",
      callToAction,
      suggestions
    } = req.body;

    // Validate required fields
    if (!purpose || !keyData) {
      return res.status(400).json({
        error: "Missing required fields: purpose and keyData are required"
      });
    }

    // Use SmythOS agent for email generation
    const smythosUrl = "https://cmfw5qbmfxvnkjxgtpjoabofw.agent.pa.smyth.ai";
    
    console.log("SmythOS URL:", smythosUrl);
    console.log("Full endpoint:", `${smythosUrl}/api/generate_email_body`);
    
    // Prepare payload for SmythOS agent
    const payload = {
      purpose,
      recipientName,
      senderName,
      keyData,
      tone,
      callToAction,
      suggestions
    };

    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    const result = await axios.post(`${smythosUrl}/api/generate_email_body`, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });

    // Return the generated email body as plain text
    console.log("SmythOS Response:", result.data);
    return res.status(200).set('Content-Type', 'text/plain').send(result.data);

  } catch (error) {
    console.error("Email generation error:", error.message);
    console.error("Error details:", error.response?.data || error);
    return res.status(500).json({
      error: "Failed to generate email body. Please try again.",
      details: error.message,
      smythosResponse: error.response?.data
    });
  }
};
