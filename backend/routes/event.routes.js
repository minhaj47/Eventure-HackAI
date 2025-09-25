import express from "express"
import {
    addEvent,
    checkGoogleFormConfig,
    fetchEventParticipants,
    generateEventRegistrationForm,
    generateGoogleForm,
    getUserEvents,
    sendBulkEventNotification,
    sendEventReminder,
    sendEventUpdate,
    updateEvent
} from "../controllers/event.controller.js"
import isAuth from "../middlewares/isAuth.js"


const eventRouter = express.Router()

// Existing routes
eventRouter.get("/all",isAuth,getUserEvents)
eventRouter.put("/update/:eventId",isAuth,updateEvent) // Restore auth
eventRouter.post("/add",isAuth,addEvent)
eventRouter.get("/participants/:eventId",isAuth,fetchEventParticipants)

// Event update routes (no authentication required)
eventRouter.post("/send-update", sendEventUpdate)
eventRouter.post("/bulk-notification", sendBulkEventNotification)
eventRouter.post("/send-reminder", sendEventReminder)

// Test route (NO authentication required)
eventRouter.get("/test", (req, res) => {
  res.json({ message: "Test route working without auth" });
});

// Google Form generation routes (NO authentication required)
eventRouter.post("/generate-google-form", generateGoogleForm)
eventRouter.post("/:eventId/generate-registration-form", generateEventRegistrationForm)
eventRouter.get("/google-form-config", checkGoogleFormConfig)

export default eventRouter