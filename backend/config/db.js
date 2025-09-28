import mongoose from "mongoose"

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
            connectTimeoutMS: 30000, // 30 seconds
            maxPoolSize: 10,
            retryWrites: true,
            retryReads: true
        })
        console.log("DB connected")
    }
    catch(error){
        console.log("Database connection error:", error.message)
        console.log("Retrying connection in 5 seconds...")
        setTimeout(connectDB, 5000)
    }
}

export default connectDB;