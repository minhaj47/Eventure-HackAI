import express from "express"
import { getCurrentUser, googleAuth, Login, logOut, signUp } from "../controllers/auth.controller.js"
import isAuth from "../middlewares/isAuth.js"

const authRouter = express.Router()

authRouter.post("/signup", signUp)
authRouter.post("/signin", Login)
authRouter.post("/google", googleAuth)
authRouter.get("/logout", logOut)
authRouter.get("/me", isAuth, getCurrentUser)

export default authRouter