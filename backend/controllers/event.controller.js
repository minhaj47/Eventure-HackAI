import Event from "../models/event.model.js"; // adjust the path as needed
import User from "../models/user.model.js";
import eventUpdateService from "../services/eventUpdateService.js";
import googleFormService from "../services/googleFormService.js";
import GoogleMeetService from "../services/googleMeetService.js";
import { extractAllContacts } from "../services/contactExtractionService.js";
import axios from "axios";

// Controller to add a new event
export const addEvent = async (req, res) => {
  try {
    console.log('=== BACKEND addEvent CALLED ===');
    console.log('Request body received:', JSON.stringify(req.body, null, 2));
    
    const { eventName, dateTime, location, eventType, description, organizerEmail, autoCreateForm = true, className, classroomcode, classroomlink } = req.body;

    console.log('=== DESTRUCTURED CLASSROOM DATA ===');
    console.log('className:', className);
    console.log('classroomcode:', classroomcode);
    console.log('classroomlink:', classroomlink);
    console.log('className type:', typeof className);
    console.log('classroomcode type:', typeof classroomcode);
    console.log('classroomlink type:', typeof classroomlink);

    // Basic validation
    if (!eventName || !dateTime || !location || !eventType) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Create a new event instance
    const eventDataForDB = {
      eventName,
      dateTime,
      location,
      eventType,
      description,
      className,
      classroomcode,
      classroomlink
    };
    
    console.log('=== EVENT DATA FOR DATABASE ===');
    console.log('Event object to be saved:', JSON.stringify(eventDataForDB, null, 2));
    
    const newEvent = new Event(eventDataForDB);

    // Save the event to the database
    const savedEvent = await newEvent.save();
    
    console.log('=== EVENT SAVED TO DATABASE ===');
    console.log('Saved event:', JSON.stringify(savedEvent, null, 2));
    console.log('Saved classroomcode:', savedEvent.classroomcode);
    console.log('Saved classroomlink:', savedEvent.classroomlink);
    
    // Add the event ID to the user's events array
    await User.findByIdAndUpdate(
      req.userId,
      { $push: { events: savedEvent._id } },
      { new: true }
    );

    let formGenerationResult = null;
    
    // Auto-create registration form if requested (default: false)
    if (autoCreateForm === true) {
      console.log('=== STARTING AUTO FORM CREATION ===');
      console.log('Event ID:', savedEvent._id);
      console.log('Event Name:', eventName);
      console.log('Organizer Email (provided):', organizerEmail);
      console.log('User ID from request:', req.userId);
      
      try {
        // Get user info for organizer email if not provided
        let finalOrganizerEmail = organizerEmail;
        if (!finalOrganizerEmail && req.userId) {
          const user = await User.findById(req.userId);
          finalOrganizerEmail = user?.email;
          console.log('Retrieved user email from database:', finalOrganizerEmail);
        }
        console.log('Final organizer email to use:', finalOrganizerEmail);

        console.log('=== CALLING GOOGLE FORM SERVICE ===');
        // Create event registration form
        const formResult = await googleFormService.createEventRegistrationForm({
          title: eventName,
          description: description,
          organizerEmail: finalOrganizerEmail
        });

        console.log('=== GOOGLE FORM SERVICE RESPONSE ===');
        console.log('Form creation success:', formResult.success);
        console.log('Form result data:', JSON.stringify(formResult.data, null, 2));

        console.log('=== CHECKING FORM RESULT SUCCESS ===');
        console.log('Form result success:', formResult.success);
        console.log('Form result data exists:', !!formResult.data);
        console.log('Form URL exists:', !!formResult.data?.formUrl);
        console.log('Form URL value:', formResult.data?.formUrl);
        console.log('Edit Form URL value:', formResult.data?.editFormUrl);

        if (formResult.success && formResult.data && formResult.data.formUrl && formResult.data.formUrl.trim() !== '') {
          console.log('=== UPDATING EVENT WITH FORM URLS ===');
          console.log('Registration Form URL:', formResult.data.formUrl);
          console.log('Edit Form URL:', formResult.data.editFormUrl);
          
          // Update the event with the form URLs
          const updatedEvent = await Event.findByIdAndUpdate(savedEvent._id, {
            registrationFormUrl: formResult.data.formUrl,
            registrationFormEditUrl: formResult.data.editFormUrl || formResult.data.formUrl
          }, { new: true });
          
          console.log('=== EVENT UPDATE SUCCESSFUL ===');
          console.log('Updated event registration form URL:', updatedEvent.registrationFormUrl);
          console.log('Updated event edit form URL:', updatedEvent.registrationFormEditUrl);
          
          formGenerationResult = {
            success: true,
            formUrl: formResult.data.formUrl,
            editFormUrl: formResult.data.editFormUrl || formResult.data.formUrl,
            formId: formResult.data.formId
          };
          
          console.log('=== FORM GENERATION RESULT ===');
          console.log('Form generation result:', JSON.stringify(formGenerationResult, null, 2));

          console.log('=== RETURNING SUCCESS RESPONSE ===');
          // Respond with the saved event including form URLs
          return res.status(201).json({
            message: "success",
            event: updatedEvent,
            formGeneration: formGenerationResult
          });
        } else {
          console.log('=== FORM CREATION FAILED - NO VALID FORM URL ===');
          console.log('Reason for failure:');
          console.log('- Success:', formResult.success);
          console.log('- Has data:', !!formResult.data);
          console.log('- Has formUrl:', !!formResult.data?.formUrl);
          console.log('- FormUrl value:', formResult.data?.formUrl);
          console.log('Complete form result:', JSON.stringify(formResult, null, 2));
          
          // Set form generation result as failed
          formGenerationResult = {
            success: false,
            error: 'No valid form URL returned from SmythOS',
            details: formResult
          };
        }
      } catch (formError) {
        console.error('=== FORM CREATION ERROR ===');
        console.error('Error details:', formError);
        console.error('Error message:', formError.message);
        console.error('Error stack:', formError.stack);
        
        formGenerationResult = {
          success: false,
          error: formError.message || 'Failed to create registration form'
        };
        console.log('Form generation error result:', JSON.stringify(formGenerationResult, null, 2));
        // Continue without failing the event creation
      }
    } else {
      console.log('=== AUTO FORM CREATION DISABLED ===');
      console.log('autoCreateForm is set to false');
    }

    // Respond with the saved event
    console.log('=== FINAL EVENT RESPONSE ===');
    console.log('Event stored in database:');
    console.log('- Event ID:', savedEvent._id);
    console.log('- Event Name:', savedEvent.eventName);
    console.log('- Registration Form URL:', savedEvent.registrationFormUrl || 'NOT SET');
    console.log('- Edit Form URL:', savedEvent.registrationFormEditUrl || 'NOT SET');
    console.log('- Form Generation Result:', JSON.stringify(formGenerationResult, null, 2));
    
    res.status(201).json({
      message: "success",
      event: savedEvent,
      formGeneration: formGenerationResult
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error. Could not create event." });
  }
};


// Controller to get all events for the authenticated user
export const getUserEvents = async (req, res) => {
  try {
    const userId = req.userId; // comes from isAuth middleware

    // Find the user and populate the events
    const user = await User.findById(userId).populate("events");
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log('=== RETRIEVING USER EVENTS ===');
    console.log('User ID:', userId);
    console.log('Number of events found:', user.events.length);
    
    // Log form URLs and classroom data for each event
    user.events.forEach((event, index) => {
      console.log(`Event ${index + 1}:`);
      console.log(`- ID: ${event._id}`);
      console.log(`- Name: ${event.eventName}`);
      console.log(`- Registration Form URL: ${event.registrationFormUrl || 'NOT SET'}`);
      console.log(`- Edit Form URL: ${event.registrationFormEditUrl || 'NOT SET'}`);
      console.log(`- Class Name: ${event.className || 'NOT SET'}`);
      console.log(`- Classroom Code: ${event.classroomcode || 'NOT SET'}`);
      console.log(`- Classroom Link: ${event.classroomlink || 'NOT SET'}`);
    });

    res.status(200).json({
      message: "success",
      events: user.events
    });
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({ message: "Server error. Could not fetch events." });
  }
};

// Controller to get a single event by ID
export const getEventById = async (req, res) => {
  try {
    console.log('=== BACKEND getEventById CALLED ===');
    const eventId = req.params.eventId;
    console.log('Event ID requested:', eventId);
    
    // Check if eventId is a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventId);
    if (!isValidObjectId) {
      console.log("Invalid ObjectId format provided:", eventId);
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    // Find the event by ID
    const event = await Event.findById(eventId);
    
    if (!event) {
      console.log("Event not found for ID:", eventId);
      return res.status(404).json({ message: "Event not found" });
    }
    
    console.log('=== EVENT FOUND ===');
    console.log('Event data:', JSON.stringify(event, null, 2));
    console.log('Form URLs:');
    console.log('- Registration Form URL:', event.registrationFormUrl || 'NOT SET');
    console.log('- Edit Form URL:', event.registrationFormEditUrl || 'NOT SET');
    console.log('Classroom data:');
    console.log('- Class Name:', event.className || 'NOT SET');
    console.log('- Classroom Code:', event.classroomcode || 'NOT SET');
    console.log('- Classroom Link:', event.classroomlink || 'NOT SET');

    res.status(200).json({
      message: "success",
      event: event
    });
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    res.status(500).json({ message: "Server error. Could not fetch event." });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId; // event ID from URL
    const { eventName, dateTime, location, eventType, description, attendeeSheetUrl, className, classroomcode, classroomlink } = req.body;

    console.log("=== UPDATE EVENT CALLED ===");
    console.log("Event ID received:", eventId);
    console.log("EventID type:", typeof eventId);
    console.log("EventID length:", eventId ? eventId.length : 'undefined');
    console.log("Request body:", req.body);
    console.log("Full req.params:", req.params);
    console.log("Request method:", req.method);
    console.log("Request URL:", req.url);

    // Check if eventId is a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventId);
    console.log("Is valid ObjectId format:", isValidObjectId);

    if (!isValidObjectId) {
      console.log("Invalid ObjectId format provided:", eventId);
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    // Find the event by ID
    const event = await Event.findById(eventId);
    console.log("Found event:", event ? "Yes" : "No");
    console.log("Event details:", event ? { id: event._id, name: event.eventName } : "None");
    
    if (!event) {
      console.log("Event not found for ID:", eventId);
      
      // Let's also check if there are any events in the database
      const allEvents = await Event.find({}).limit(5);
      console.log("Total events in database:", allEvents.length);
      console.log("Sample event IDs:", allEvents.map(e => ({ id: e._id.toString(), name: e.eventName })));
      
      return res.status(404).json({ message: "Event not found" });
    }

    // Update only the fields provided in the request
    if (eventName) event.eventName = eventName;
    if (dateTime) event.dateTime = dateTime;
    if (location) event.location = location;
    if (eventType) event.eventType = eventType;
    if (description !== undefined) event.description = description;
    if (attendeeSheetUrl !== undefined) event.attendeeSheetUrl = attendeeSheetUrl;
    if (className !== undefined) event.className = className;
    if (classroomcode !== undefined) event.classroomcode = classroomcode;
    if (classroomlink !== undefined) event.classroomlink = classroomlink;

    // Save the updated event
    const updatedEvent = await event.save();

    res.status(200).json({
      message: "success",
      event: updatedEvent
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error. Could not update event." });
  }
};

// Controller to send event update notifications
export const sendEventUpdate = async (req, res) => {
  try {
    const { sheetLink, emailSubject, emailBody } = req.body;

    // Validate input
    eventUpdateService.validateEventUpdate({
      sheetLink,
      emailSubject,
      emailBody
    });

    // Send event update
    const result = await eventUpdateService.sendEventUpdate({
      sheetLink,
      emailSubject,
      emailBody
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Send event update error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Invalid request data'
    });
  }
};

// Controller to send bulk event notifications
export const sendBulkEventNotification = async (req, res) => {
  try {
    const { 
      eventId,
      sheetLink, 
      customMessage
    } = req.body;

    // Validate required fields
    if (!eventId || !sheetLink) {
      return res.status(400).json({
        success: false,
        message: "eventId and sheetLink are required"
      });
    }

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Send bulk notification
    const result = await eventUpdateService.sendBulkEventNotification(
      event,
      sheetLink,
      customMessage
    );

    res.status(result.success ? 200 : 500).json(result);

  } catch (error) {
    console.error('Bulk notification error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send bulk notification'
    });
  }
};

// Controller to send event reminders
export const sendEventReminder = async (req, res) => {
  try {
    const { eventId, sheetLink } = req.body;

    // Validate required fields
    if (!eventId || !sheetLink) {
      return res.status(400).json({
        success: false,
        message: "eventId and sheetLink are required"
      });
    }

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check if event is in the future
    const eventDate = new Date(event.dateTime);
    const now = new Date();
    if (eventDate <= now) {
      return res.status(400).json({
        success: false,
        message: "Cannot send reminder for past events"
      });
    }

    // Send reminder
    const result = await eventUpdateService.sendEventReminder(
      event,
      sheetLink
    );

    res.status(result.success ? 200 : 500).json(result);

  } catch (error) {
    console.error('Event reminder error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send event reminder'
    });
  }
};

/**
 * Controller to generate Google Form for general use
 * 
 * Expected Request Body:
 * {
 *   formTitle: string (required) - Title for the Google Form
 *   formDescription?: string (optional) - Description for the form
 *   editorEmail?: string (optional) - Email for edit access, defaults to current user
 *   customFields?: Array<{
 *     type: string (required) - Field type (text, email, etc.)
 *     label: string (required) - Field label/name
 *     required?: boolean (optional) - Whether field is required, defaults to false
 *     options?: string[] (optional) - Options for select/radio fields
 *   }>
 * }
 * 
 * Response Format:
 * {
 *   success: boolean
 *   data: {
 *     formTitle: string
 *     formUrl: string - Public form URL for responses
 *     editFormUrl: string - Edit URL for form owner
 *     formId: string - Google Form ID
 *     instructions: string - Additional instructions
 *   }
 *   message: string
 * }
 */
export const generateGoogleForm = async (req, res) => {
  try {
    const { formTitle, formDescription, editorEmail, customFields } = req.body;

    // Validation
    if (!formTitle) {
      return res.status(400).json({
        success: false,
        message: "Form title is required"
      });
    }

    // Validate customFields structure if provided
    if (customFields && !Array.isArray(customFields)) {
      return res.status(400).json({
        success: false,
        message: "customFields must be an array"
      });
    }

    if (customFields && customFields.length > 0) {
      // Validate each custom field has required properties
      for (let i = 0; i < customFields.length; i++) {
        const field = customFields[i];
        if (!field.label || !field.type) {
          return res.status(400).json({
            success: false,
            message: `Invalid custom field at index ${i}: label and type are required`
          });
        }
      }
    }

    // Log the incoming request for debugging
    console.log('=== GOOGLE FORM GENERATION REQUEST ===');
    console.log('Form Title:', formTitle);
    console.log('Form Description:', formDescription || 'Not provided');
    console.log('Editor Email:', editorEmail || 'Not provided (will use default)');
    console.log('Custom Fields:', customFields ? `Array with ${customFields.length} fields` : 'None');
    
    if (customFields && customFields.length > 0) {
      console.log('Custom Fields Details:');
      customFields.forEach((field, index) => {
        console.log(`  ${index + 1}. ${field.label || 'No label'} (${field.type || 'no type'}) - ${field.required ? 'Required' : 'Optional'}`);
      });
    }
    
    console.log('Raw Request Body:', JSON.stringify(req.body, null, 2));

    // Get user info for editor email if not provided
    let finalEditorEmail = editorEmail;
    if (!finalEditorEmail && req.userId) {
      console.log('No editorEmail provided, fetching from authenticated user...');
      const user = await User.findById(req.userId);
      finalEditorEmail = user?.email;
      console.log('✅ Using authenticated user email as editor:', finalEditorEmail);
    } else if (finalEditorEmail) {
      console.log('📧 Using provided editor email:', finalEditorEmail);
    } else {
      console.log('⚠️ No editor email available - form will be created without editor access');
    }

    // Create Google Form using SmythOS
    const result = await googleFormService.createGoogleForm({
      formTitle,
      formDescription,
      editorEmail: finalEditorEmail,
      customFields
    });

    console.log('Google Form creation result:', result);
    res.status(200).json(result);

  } catch (error) {
    console.error('Google Form generation error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.error || error.message || 'Failed to generate Google Form'
    });
  }
};

/**
 * Controller to generate Google Form for a specific event
 * 
 * URL Parameters:
 * - eventId: string (required) - MongoDB ObjectId of the event
 * 
 * Expected Request Body:
 * {
 *   editorEmail?: string (optional) - Email for edit access, defaults to current user
 *   forceRegenerate?: boolean (optional) - Force regeneration even if form exists
 *   customFields?: Array<{
 *     type: string (required) - Field type (text, email, etc.)
 *     label: string (required) - Field label/name
 *     required?: boolean (optional) - Whether field is required
 *     options?: string[] (optional) - Options for select/radio fields
 *   }> - Custom fields for the registration form
 * }
 * 
 * Response Format:
 * {
 *   success: boolean
 *   data: {
 *     formTitle: string
 *     formUrl: string - Public form URL for responses
 *     editFormUrl: string - Edit URL for form owner  
 *     formId: string - Google Form ID
 *     instructions: string - Additional instructions
 *   }
 *   message: string
 *   isExisting?: boolean - Whether form already existed
 *   event: {
 *     id: string
 *     name: string
 *     description: string
 *   }
 * }
 * 
 * Note: This endpoint automatically saves form URLs to the event database record
 */
export const generateEventRegistrationForm = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { editorEmail, forceRegenerate, customFields } = req.body;

    console.log('=== EVENT REGISTRATION FORM REQUEST ===');
    console.log('Event ID:', eventId);
    console.log('Editor Email:', editorEmail || 'Not provided (will use default)');
    console.log('Force Regenerate:', forceRegenerate || false);
    console.log('Custom Fields:', customFields ? `Array with ${customFields.length} fields` : 'None');
    
    if (customFields && customFields.length > 0) {
      console.log('Custom Fields Details:');
      customFields.forEach((field, index) => {
        console.log(`  ${index + 1}. ${field.label || 'No label'} (${field.type || 'no type'}) - ${field.required ? 'Required' : 'Optional'}`);
      });
    }
    
    console.log('Raw Request Body:', JSON.stringify(req.body, null, 2));

    // Validate customFields structure if provided
    if (customFields && !Array.isArray(customFields)) {
      return res.status(400).json({
        success: false,
        message: "customFields must be an array"
      });
    }

    if (customFields && customFields.length > 0) {
      // Validate each custom field has required properties
      for (let i = 0; i < customFields.length; i++) {
        const field = customFields[i];
        if (!field.label || !field.type) {
          return res.status(400).json({
            success: false,
            message: `Invalid custom field at index ${i}: label and type are required`
          });
        }
      }
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check if form already exists and forceRegenerate is not true
    if (event.registrationFormUrl && !forceRegenerate) {
      return res.status(200).json({
        success: true,
        data: {
          formTitle: `${event.eventName} - Registration Form`,
          formUrl: event.registrationFormUrl,
          editFormUrl: event.registrationFormEditUrl,
          formId: '', // We don't store formId separately
          instructions: 'Form already exists for this event'
        },
        message: 'Form already exists for this event',
        isExisting: true,
        event: {
          id: event._id,
          name: event.eventName,
          description: event.description
        }
      });
    }

    // Get user info for organizer email if not provided
    let organizerEmail = editorEmail;
    if (!organizerEmail && req.userId) {
      console.log('No editorEmail provided for event form, fetching from authenticated user...');
      const user = await User.findById(req.userId);
      organizerEmail = user?.email;
      console.log('✅ Using authenticated user email as event form editor:', organizerEmail);
    } else if (organizerEmail) {
      console.log('📧 Using provided editor email for event form:', organizerEmail);
    }
    
    // If still no organizer email, log warning
    if (!organizerEmail) {
      console.warn('⚠️ No organizer email available for event registration form - form will be created without editor access');
    }

    // Create event registration form with custom fields if provided
    const result = await googleFormService.createEventRegistrationForm({
      title: event.eventName,
      description: event.description,
      organizerEmail,
      customFields: customFields // Pass custom fields to service
    });

    // Update the event with the form URL
    if (result.success && result.data.formUrl) {
      console.log('=== UPDATING EVENT WITH FORM URLS (GENERATE ENDPOINT) ===');
      console.log('Event ID:', eventId);
      console.log('Registration Form URL to store:', result.data.formUrl);
      console.log('Edit Form URL to store:', result.data.editFormUrl || result.data.formUrl);
      
      const updatedEvent = await Event.findByIdAndUpdate(eventId, {
        registrationFormUrl: result.data.formUrl,
        registrationFormEditUrl: result.data.editFormUrl || result.data.formUrl
      }, { new: true });
      
      console.log('=== EVENT UPDATE COMPLETE (GENERATE ENDPOINT) ===');
      console.log('Stored registration form URL:', updatedEvent.registrationFormUrl);
      console.log('Stored edit form URL:', updatedEvent.registrationFormEditUrl);
      console.log('Full updated event:', JSON.stringify({
        _id: updatedEvent._id,
        eventName: updatedEvent.eventName,
        registrationFormUrl: updatedEvent.registrationFormUrl,
        registrationFormEditUrl: updatedEvent.registrationFormEditUrl
      }, null, 2));
    }

    res.status(200).json({
      ...result,
      isExisting: false,
      event: {
        id: event._id,
        name: event.eventName,
        description: event.description
      }
    });

  } catch (error) {
    console.error('Event registration form generation error:', error);
    
    // Provide specific error messages for different error types
    let errorMessage = 'Failed to generate event registration form';
    let errorCode = error.status || 500;
    
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      errorMessage = 'Form generation timed out. The SmythOS service may be temporarily unavailable. Please try again later.';
      errorCode = 408; // Request Timeout
    } else if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Unable to connect to the form generation service. Please check your internet connection and try again.';
      errorCode = 503; // Service Unavailable
    } else if (error.isRetryableError && error.retryCount >= 3) {
      errorMessage = 'Form generation failed after multiple attempts. The service may be temporarily unavailable. Please try again in a few minutes.';
      errorCode = 503; // Service Unavailable
    }
    
    res.status(errorCode).json({
      success: false,
      message: errorMessage,
      code: error.code,
      retryCount: error.retryCount,
      canRetry: error.isRetryableError && error.retryCount < 3
    });
  }
};

// Controller to check SmythOS Google Form service configuration
export const checkGoogleFormConfig = async (req, res) => {
  try {
    const validation = googleFormService.validateConfiguration();
    
    res.status(200).json({
      success: true,
      configuration: validation
    });

  } catch (error) {
    console.error('Configuration check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check configuration'
    });
  }
};

// Test controller to debug form creation
export const testFormCreation = async (req, res) => {
  try {
    console.log('=== TESTING FORM CREATION ===');
    
    // Test basic form creation
    const testResult = await googleFormService.createGoogleForm({
      formTitle: "Test Form - " + new Date().toISOString(),
      formDescription: "This is a test form to debug form creation",
      editorEmail: "test@example.com"
    });

    console.log('=== TEST FORM CREATION RESULT ===');
    console.log('Result:', JSON.stringify(testResult, null, 2));

    res.status(200).json({
      success: true,
      testResult,
      message: 'Form creation test completed'
    });

  } catch (error) {
    console.error('=== FORM CREATION TEST ERROR ===');
    console.error('Error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Form creation test failed',
      details: error
    });
  }
};

// Controller to fetch participants from event's attendee sheet
export const fetchEventParticipants = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Find the event by ID
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    if (!event.attendeeSheetUrl) {
      return res.status(400).json({ 
        success: false, 
        message: "No attendee sheet connected to this event" 
      });
    }

    // Extract contacts from the Google Sheet using SmythOS API
    const rawResponse = await extractAllContacts(event.attendeeSheetUrl);
    
    // Parse the SmythOS response structure: result.Output.contacts.contacts[]
    let participants = [];
    
    if (rawResponse && rawResponse.result && rawResponse.result.Output && 
        rawResponse.result.Output.contacts && rawResponse.result.Output.contacts.contacts) {
      
      const contactsArray = rawResponse.result.Output.contacts.contacts;
      
      participants = contactsArray.map((contact, index) => ({
        id: index + 1,
        name: contact.name || contact.Name || `Participant ${index + 1}`,
        email: contact.email || contact.Email || '',
        status: "confirmed",
        registeredAt: new Date().toISOString().split('T')[0]
      }));
    }

    res.status(200).json({
      success: true,
      participants: participants
    });

  } catch (error) {
    console.error("Failed to fetch participants:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch participants from Google Sheet",
      error: error.message 
    });
  }
};

// Controller to update classroom code and link for an event
export const updateEventClassroom = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const {className,classroomcode, classroomlink } = req.body;

    console.log("=== UPDATE EVENT CLASSROOM CALLED ===");
    console.log("Event ID:", eventId);
    console.log("Classroom Code:", classroomcode);
    console.log("Classroom Link:", classroomlink);
    console.log("Class Name:", className);

    // Validate eventId format
    

    // Validate that at least one classroom field is provided
    if (className === undefined && classroomcode === undefined && classroomlink === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update (className, classroomcode, or classroomlink)"
      });
    }
    console.log("Classroom update fields validated");
    console.log("Classroomcode type:", typeof classroomcode);
    console.log("Classroomlink type:", typeof classroomlink);
    // Find the event by ID
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
    }

    // Prepare update object with only provided fields
    const updateFields = {};
    if (classroomcode !== undefined) {
      updateFields.classroomcode = classroomcode;
    }
    if (classroomlink !== undefined) {
      updateFields.classroomlink = classroomlink;
    }
    if (className !== undefined) {
      updateFields.className = className;
    }

    console.log("Update fields prepared:", updateFields);

    // Update the event with new classroom information
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      updateFields,
      { new: true, runValidators: true }
    );

    console.log("=== CLASSROOM UPDATE SUCCESSFUL ===");
    console.log("Updated class name:", updatedEvent.className);
    console.log("Updated classroom code:", updatedEvent.classroomcode);
    console.log("Updated classroom link:", updatedEvent.classroomlink);

    res.status(200).json({
      success: true,
      message: "Classroom information updated successfully",
      event: {
        _id: updatedEvent._id,
        eventName: updatedEvent.eventName,
        className: updatedEvent.className,
        classroomcode: updatedEvent.classroomcode,
        classroomlink: updatedEvent.classroomlink,
        updatedAt: updatedEvent.updatedAt
      }
    });

  } catch (error) {
    console.error("Error updating event classroom:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Could not update classroom information.",
      error: error.message 
    });
  }
};

// Controller to delete an event
export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.userId; // from isAuth middleware

    console.log("=== DELETE EVENT CALLED ===");
    console.log("Event ID:", eventId);
    console.log("User ID:", userId);

    // Validate eventId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventId);
    if (!isValidObjectId) {
      console.log("Invalid ObjectId format provided:", eventId);
      return res.status(400).json({ 
        success: false,
        message: "Invalid event ID format" 
      });
    }

    // Find the event by ID
    const event = await Event.findById(eventId);
    
    if (!event) {
      console.log("Event not found for ID:", eventId);
      return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
    }

    console.log("Found event to delete:", {
      id: event._id,
      name: event.eventName,
      eventType: event.eventType
    });

    // Delete the event from the database
    await Event.findByIdAndDelete(eventId);

    // Remove the event reference from the user's events array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { events: eventId } },
      { new: true }
    );

    console.log("=== EVENT DELETION SUCCESSFUL ===");
    console.log("Deleted event ID:", eventId);
    console.log("Removed from user's events array");

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      deletedEvent: {
        _id: event._id,
        eventName: event.eventName,
        eventType: event.eventType,
        dateTime: event.dateTime
      }
    });

  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Could not delete event.",
      error: error.message 
    });
  }
};

// Generate AI-powered event announcement
export const generateEventAnnouncement = async (req, res) => {
  try {
    const {
      announcementMessage,
      eventName,
      eventType,
      suggestions
    } = req.body;

    // Validate required fields
    if (!announcementMessage || !eventName || !eventType) {
      return res.status(400).json({
        error: "Missing required fields: announcementMessage, eventName, and eventType are required"
      });
    }

    // Use SmythOS agent for announcement generation
    const smythosUrl = "https://cmfw5qbmfxvnkjxgtpjoabofw.agent.a.smyth.ai";
    
    console.log("SmythOS URL:", smythosUrl);
    console.log("Full endpoint:", `${smythosUrl}/api/generate_event_announcement`);
    
    // Prepare payload for SmythOS agent
    const payload = {
      announcementMessage,
      eventName,
      eventType,
      suggestions
    };

    console.log("Sending announcement payload:", JSON.stringify(payload, null, 2));

    const result = await axios.post(`${smythosUrl}/api/generate_event_announcement`, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });

    // Extract the clean announcement text from the nested response
    console.log("SmythOS Announcement Response:", result.data);
    
    let announcementText = "";
    
    // Extract the announcement message from the nested structure
    if (result.data && result.data.result && result.data.result.Output && result.data.result.Output.announcementMessage) {
      announcementText = result.data.result.Output.announcementMessage;
    } else if (typeof result.data === 'string') {
      // In case the response is already a string
      announcementText = result.data;
    } else if (result.data && result.data.announcementMessage) {
      // Alternative structure
      announcementText = result.data.announcementMessage;
    } else {
      // Fallback - return the whole response if structure is unexpected
      console.warn("Unexpected SmythOS response structure:", result.data);
      announcementText = JSON.stringify(result.data);
    }
    
    console.log("Extracted announcement text:", announcementText);
    return res.status(200).send(announcementText);

  } catch (error) {
    console.error("Event announcement generation error:", error.message);
    console.error("Error details:", error.response?.data || error);
    return res.status(500).json({
      error: "Failed to generate event announcement. Please try again.",
      details: error.message,
      smythosResponse: error.response?.data
    });
  }
};

/**
 * Controller to create Google Meet meeting
 * 
 * Expected Request Body:
 * {
 *   meetingTitle: string (required) - Title for the Google Meet
 *   startDateTime: string (required) - Start date and time in ISO format
 *   endDateTime: string (required) - End date and time in ISO format
 *   editorEmail?: string (optional) - Email for admin access, defaults to current user
 *   description?: string (optional) - Meeting description
 * }
 * 
 * Returns:
 * {
 *   success: boolean,
 *   meetingTitle: string,
 *   meetingUrl: string,
 *   meetingId: string,
 *   startDateTime: string,
 *   endDateTime: string,
 *   calendarEventId: string,
 *   instructions: string
 * }
 */
export const createGoogleMeet = async (req, res) => {
  try {
    console.log('=== CREATE GOOGLE MEET CONTROLLER CALLED ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User from auth:', req.user ? { id: req.user.id, email: req.user.email } : 'No auth user');
    console.log('Environment check:');
    console.log('SMYTHOS_GOOGLE_MEET_URL:', process.env.SMYTHOS_GOOGLE_MEET_URL);
    console.log('SMYTHOS_AGENT_URL:', process.env.SMYTHOS_AGENT_URL);
    
    const {
      eventId,
      meetingTitle,
      startDateTime,
      endDateTime,
      editorEmail,
      description
    } = req.body;

    // Validate required fields
    if (!eventId || !meetingTitle || !startDateTime || !endDateTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: eventId, meetingTitle, startDateTime, and endDateTime are required"
      });
    }

    // Verify event exists and user has access
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Validate date format and logic
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use ISO format (e.g., 2024-01-01T10:00:00Z)"
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time"
      });
    }

    // Determine editor email - use provided email or fall back to authenticated user
    let finalEditorEmail = editorEmail;
    if (!finalEditorEmail && req.user && req.user.email) {
      finalEditorEmail = req.user.email;
      console.log('⚡ Using authenticated user email as editor:', finalEditorEmail);
    } else if (!finalEditorEmail) {
      console.log('⚠️ No editor email available - meeting will be created without editor access');
    }

    // Create Google Meet using SmythOS
    const googleMeetService = new GoogleMeetService();
    console.log('GoogleMeetService instantiated in controller with endpoint:', googleMeetService.smythosEndpoint);
    const result = await googleMeetService.createGoogleMeet({
      meetingTitle,
      startDateTime,
      endDateTime,
      editorEmail: finalEditorEmail,
      description
    });

    console.log('Google Meet creation result:', result);

    // If meeting creation was successful, store it in the database
    if (result.success) {
      const meetingData = {
        meetingTitle: result.meetingTitle || meetingTitle,
        meetingUrl: result.meetingUrl || result.displayData?.meetLink,
        meetingId: result.meetingId || result.displayData?.eventId,
        calendarLink: result.calendarUrl || result.displayData?.calendarLink,
        calendarEventId: result.calendarEventId || result.displayData?.eventId,
        editorEmail: finalEditorEmail,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        createdBy: req.user?.email || 'system'
      };

      // Add meeting to event's googleMeets array
      event.googleMeets.push(meetingData);
      await event.save();

      console.log('Google Meet saved to database for event:', eventId);
    }

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Google Meet creation error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.error || error.message || 'Failed to create Google Meet'
    });
  }
};

/**
 * Get all Google Meets for a specific event
 */
export const getEventGoogleMeets = async (req, res) => {
  try {
    console.log('=== GET EVENT GOOGLE MEETS ===');
    const { eventId } = req.params;
    
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required"
      });
    }

    // Get event with Google Meets
    const event = await Event.findById(eventId).select('googleMeets eventName');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    console.log(`Found ${event.googleMeets.length} Google Meets for event: ${event.eventName}`);

    res.status(200).json({
      success: true,
      eventName: event.eventName,
      meetings: event.googleMeets || []
    });

  } catch (error) {
    console.error('Error fetching Google Meets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Google Meets'
    });
  }
};

/**
 * Controller to check SmythOS Google Meet service configuration
 */
export const checkGoogleMeetConfig = async (req, res) => {
  try {
    const googleMeetService = new GoogleMeetService();
    const validation = googleMeetService.validateConfiguration();
    
    res.status(200).json({
      success: true,
      configuration: validation
    });

  } catch (error) {
    console.error('Google Meet configuration check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check Google Meet configuration'
    });
  }
};