import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import connectDB from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import eventRouter from "./routes/event.routes.js"
import userRouter from "./routes/user.routes.js"
import emailRouter from "./routes/email.routes.js"
import contactRouter from "./routes/contact.routes.js"
import proxyRouter from "./routes/proxy.routes.js"
import classroomRouter from "./routes/classroom.routes.js"
dotenv.config()

const app = express()

const port =  8000
app.use(
    cors(
        {
            origin: [
                "http://localhost:3000", // Next.js default port
                "http://localhost:3001", // Next.js alternative port
                "http://localhost:3002", // Next.js alternative port (current)
                "http://localhost:5173", // Vite default port
                process.env.FRONTEND_URL // Production frontend URL
            ].filter(Boolean),
            credentials:true
        }
    )
)
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/event",eventRouter)
app.use("/api",emailRouter)
app.use("/api",contactRouter)
app.use("/api/proxy", proxyRouter)
app.use("/api", classroomRouter)

app.listen(port,()=>{
    connectDB()
    console.log("server started")
})