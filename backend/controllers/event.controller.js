import Event from "../models/event.model.js"; // adjust the path as needed
import User from "../models/user.model.js";
import eventUpdateService from "../services/eventUpdateService.js";
import googleFormService from "../services/googleFormService.js";
import { extractAllContacts } from "../services/contactExtractionService.js";

// Controller to add a new event
export const addEvent = async (req, res) => {
  try {
    console.log('=== BACKEND addEvent CALLED ===');
    console.log('Request body received:', JSON.stringify(req.body, null, 2));
    
    const { eventName, dateTime, location, eventType, description, organizerEmail, autoCreateForm = true, classroomcode, classroomlink } = req.body;

    console.log('=== DESTRUCTURED CLASSROOM DATA ===');
    console.log('classroomcode:', classroomcode);
    console.log('classroomlink:', classroomlink);
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


export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId; // event ID from URL
    const { eventName, dateTime, location, eventType, description, attendeeSheetUrl, classroomcode, classroomlink } = req.body;

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

// Controller to generate Google Form for general use
export const generateGoogleForm = async (req, res) => {
  try {
    const { formTitle, formDescription, editorEmail } = req.body;

    // Validation
    if (!formTitle) {
      return res.status(400).json({
        success: false,
        message: "Form title is required"
      });
    }

    // Create Google Form using SmythOS
    const result = await googleFormService.createGoogleForm({
      formTitle,
      formDescription,
      editorEmail
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

// Controller to generate Google Form for a specific event
export const generateEventRegistrationForm = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { editorEmail, forceRegenerate } = req.body;

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
      const user = await User.findById(req.userId);
      organizerEmail = user?.email;
    }
    
    // If still no organizer email, use a default or skip
    if (!organizerEmail) {
      console.warn('No organizer email provided for event registration form');
    }

    // Create event registration form
    const result = await googleFormService.createEventRegistrationForm({
      title: event.eventName,
      description: event.description,
      organizerEmail
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
    const { classroomcode, classroomlink } = req.body;

    console.log("=== UPDATE EVENT CLASSROOM CALLED ===");
    console.log("Event ID:", eventId);
    console.log("Classroom Code:", classroomcode);
    console.log("Classroom Link:", classroomlink);

    // Validate eventId format
    

    // Validate that at least one classroom field is provided
    if (classroomcode === undefined && classroomlink === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update (classroomcode or classroomlink)"
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

    // Update the event with new classroom information
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      updateFields,
      { new: true, runValidators: true }
    );

    console.log("=== CLASSROOM UPDATE SUCCESSFUL ===");
    console.log("Updated classroom code:", updatedEvent.classroomcode);
    console.log("Updated classroom link:", updatedEvent.classroomlink);

    res.status(200).json({
      success: true,
      message: "Classroom information updated successfully",
      event: {
        _id: updatedEvent._id,
        eventName: updatedEvent.eventName,
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