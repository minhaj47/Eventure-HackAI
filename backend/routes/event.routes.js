import express from "express"
import { addEvent,getUserEvents,updateEvent } from "../controllers/event.controller.js"
import isAuth from "../middlewares/isAuth.js"


const eventRouter = express.Router()

eventRouter.get("/all",isAuth,getUserEvents)
eventRouter.put("/update/:eventId",isAuth,updateEvent)
eventRouter.post("/add",isAuth,addEvent)

export default eventRouter