import Event from "../models/event.model.js"; // adjust the path as needed
import User from "../models/user.model.js";
import eventUpdateService from "../services/eventUpdateService.js";
// Controller to add a new event
export const addEvent = async (req, res) => {
  try {
    const { eventName, dateTime, location, eventType, description } = req.body;

    // Basic validation
    if (!eventName || !dateTime || !location || !eventType) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Create a new event instance
    const newEvent = new Event({
      eventName,
      dateTime,
      location,
      eventType,
      description
    });

    // Save the event to the database
    const savedEvent = await newEvent.save();
    // Add the event ID to the user's events array
    await User.findByIdAndUpdate(
      req.userId,
      { $push: { events: savedEvent._id } },
      { new: true }
    );
    // Respond with the saved event
    res.status(201).json({
      message: "success",
      event: savedEvent
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
    const eventId = req.params.id; // event ID from URL
    const { eventName, dateTime, location, eventType, description } = req.body;

    // Find the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Update only the fields provided in the request
    if (eventName) event.eventName = eventName;
    if (dateTime) event.dateTime = dateTime;
    if (location) event.location = location;
    if (eventType) event.eventType = eventType;
    if (description !== undefined) event.description = description;

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