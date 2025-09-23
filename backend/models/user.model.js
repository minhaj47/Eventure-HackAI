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
            required:true
        },
         events: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Event"
            }
        ]
        

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