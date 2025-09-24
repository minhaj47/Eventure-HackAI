import express from "express"
import { 
  addEvent,
  getUserEvents,
  updateEvent,
  sendEventUpdate,
  sendBulkEventNotification,
  sendEventReminder
} from "../controllers/event.controller.js"
import isAuth from "../middlewares/isAuth.js"


const eventRouter = express.Router()

// Existing routes
eventRouter.get("/all",isAuth,getUserEvents)
eventRouter.put("/update/:eventId",isAuth,updateEvent)
eventRouter.post("/add",isAuth,addEvent)

// New event update routes (no authentication required)
eventRouter.post("/send-update", sendEventUpdate)
eventRouter.post("/bulk-notification", sendBulkEventNotification)
eventRouter.post("/send-reminder", sendEventReminder)

export default eventRouter