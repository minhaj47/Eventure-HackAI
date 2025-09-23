import axios from "axios";

const geminiResponse = async (command,assistantName,userName) => {
    try{
        const apiUrl = process.env.GEMINI_API_URL
        const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | 
          "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" | 
          "instagram-open" | "facebook-open" | "weather-show",
  "userinput": "<original user input> {only remove your name from userinput if exists and If someone asks to search something on Google or YouTube, then only that searched text will go into userInput.},
  "response": "<a short spoken response to read out loud to the user>"
}

you must send the "userinput" in your JSON response.

Instructions:
- "type": determine the intent of the user.
- "userinput": original sentence the user spoke.
- "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.


Type meanings:
- "general": if it's a factual or informational question. if any one ask you such question and you know the answare 
give a short answer for this question. 
- "google-search": if user wants to search something on Google.
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to open a calculator.
- "instagram-open": if user wants to open instagram.
- "facebook-open": if user wants to open facebook.
- "weather-show": if user wants to know weather.
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.

Important:
- Use "{author name}" jodi kew jigges kore tomake ke baniyece . The author name is "Mahfuj Rahman"
- Only respond with the JSON object, nothing else.

now your userinput - ${command}
`;

        const result = await axios.post(apiUrl,{
            "contents":[
                {
                    "parts":[{"text":prompt}]
                }
            ]
        })

        return result.data.candidates[0].content.parts[0].text
    }catch(err){
          console.log(err)
    }
}

export default geminiResponse;

// import {
//   GoogleGenerativeAI,
//   HarmCategory,
//   HarmBlockThreshold,
// } from "@google/generative-ai";

// const geminiResponse = async (command, assistantName, userName) => {
//   try {
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use a model that supports this feature, like 1.5 Pro or Flash.

//     const generationConfig = {
//       responseMimeType: "application/json",
//       responseSchema: {
//         type: "object",
//         properties: {
//           type: {
//             type: "string",
//             enum: [
//               "general", "google-search", "youtube-search", "youtube-play",
//               "get-time", "get-date", "get-day", "get-month", "calculator-open",
//               "instagram-open", "facebook-open", "weather-show",
//             ],
//           },
//           userinput: {
//             type: "string",
//             description: "The processed user input, stripped of the assistant's name and containing only the search query if it's a search request."
//           },
//           response: {
//             type: "string",
//             description: "A short spoken response to read out loud to the user.",
//           },
//         },
//         required: ["type", "userinput", "response"],
//       },
//     };

//     const prompt = `
// You are a virtual assistant named ${assistantName}, created by ${userName}.
// You are not Google. You will now behave like a voice-enabled assistant.

// Your task is to understand the user's natural language input and respond with a JSON object.

// Input: "${command}"

// Instructions for populating the fields:
// - The "userinput" field should contain the original user's input.
// - If the input contains your name, remove it from the "userinput" field.
// - If the input is a search request for Google or YouTube, only the search query text should go into the "userinput" field.
// - The "type" field must match one of the predefined categories.
// - The "response" field must be a short, voice-friendly reply.

// Example for clarity:
// - Input: "Hey ${assistantName}, search on google for the best movies of 2024"
// - userinput: "the best movies of 2024"
// - type: "google-search"
// - response: "Searching Google for you."

// Now, process the following input: "${command}"
// `;

//     const safetySettings = [{
//       category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//       threshold: HarmBlockThreshold.BLOCK_NONE,
//     }, ];

//     const result = await model.generateContent({
//       contents: [{
//         parts: [{
//           text: prompt
//         }]
//       }],
//       generationConfig,
//       safetySettings,
//     });

//     const text = result?.response?.text();

//     if (!text) {
//       return JSON.stringify({
//         type: "general",
//         userinput: command,
//         response: "Sorry, I didn’t get any response.",
//       });
//     }

//     // The result is already a clean JSON string, so you can return it directly.
//     return text;

//   } catch (err) {
//     console.error("Gemini Error:", err?.message);
//     return JSON.stringify({
//       type: "general",
//       userinput: command,
//       response: "Something went wrong while contacting Gemini.",
//     });
//   }
// };

// export default geminiResponse;