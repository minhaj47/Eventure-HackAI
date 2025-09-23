import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token 
        
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." })
        }

        const verifyToken = await jwt.verify(token, process.env.JWT_SECRET)
        
        // Verify user still exists
        const user = await User.findById(verifyToken.userId).select("-password")
        
        if (!user) {
            return res.status(401).json({ message: "Access denied. User not found." })
        }

        req.userId = verifyToken.userId
        req.user = user
        
        next()
        
    } catch (err) {
        console.log("Auth middleware error:", err)
        
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token." })
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired." })
        } else {
            return res.status(500).json({ message: "Authentication error" })
        }
    }
}

export default isAuth