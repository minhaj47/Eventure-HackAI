import express from "express"
import {
    addEvent,
    checkGoogleFormConfig,
    deleteEvent,
    fetchEventParticipants,
    generateEventRegistrationForm,
    generateGoogleForm,
    getUserEvents,
    sendBulkEventNotification,
    sendEventReminder,
    sendEventUpdate,
    testFormCreation,
    updateEvent,
    updateEventClassroom
} from "../controllers/event.controller.js"
import isAuth from "../middlewares/isAuth.js"


const eventRouter = express.Router()

// Debug: Log that routes are being registered
console.log('=== REGISTERING EVENT ROUTES ===');
console.log('updateEventClassroom function:', typeof updateEventClassroom);

// Existing routes
eventRouter.get("/all",isAuth,getUserEvents)
eventRouter.put("/update/:eventId",isAuth,updateEvent) // Restore auth
eventRouter.put("/update-classroom/:eventId",updateEventClassroom) // New classroom update route (temp no auth)
console.log('Registered update-classroom route');
eventRouter.post("/add",isAuth,addEvent)
eventRouter.delete("/delete/:eventId",isAuth,deleteEvent) // Delete event route
eventRouter.get("/participants/:eventId",isAuth,fetchEventParticipants)

// Event update routes (no authentication required)
eventRouter.post("/send-update", sendEventUpdate)
eventRouter.post("/bulk-notification", sendBulkEventNotification)
eventRouter.post("/send-reminder", sendEventReminder)

// Test route (NO authentication required)
eventRouter.get("/test", (req, res) => {
  res.json({ message: "Test route working without auth" });
});

// Debug route for classroom update (NO auth for testing)
eventRouter.put("/update-classroom-test/:eventId", (req, res) => {
  res.json({ message: "Classroom update route accessible", eventId: req.params.eventId, body: req.body });
});

// Google Form generation routes (NO authentication required)
eventRouter.post("/generate-google-form", generateGoogleForm)
eventRouter.post("/:eventId/generate-registration-form", generateEventRegistrationForm)
eventRouter.get("/google-form-config", checkGoogleFormConfig)
eventRouter.get("/test-form-creation", testFormCreation)

export default eventRouter