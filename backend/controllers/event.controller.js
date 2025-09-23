import Event from "../models/event.model.js"; // adjust the path as needed
import User from "../models/user.model.js";
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