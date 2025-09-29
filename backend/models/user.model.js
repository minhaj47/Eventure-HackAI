import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required: true,
            unique:true
        },
        password:{
            type:String,
            required:false // Not required for Google OAuth users
        },
        googleId:{
            type:String,
            unique:true,
            sparse:true // Allows null values and ensures uniqueness only for non-null values
        },
        image:{
            type:String,
            required:false
        },
        authProvider:{
            type:String,
            enum:['local', 'google'],
            default:'local'
        },
         events: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Event"
            }
        ],
        className: {
            type: String,
            trim: true
        }
        

    },
    {timestamps:true}
)
const User = mongoose.model("User",userSchema);
export default User;
/* 
✅ What does { timestamps: true } do?
It automatically adds two fields to your schema:

createdAt – the date and time when the document was first created.

updatedAt – the date and time when the document was last updated.
*/