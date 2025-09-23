import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true
    },
    dateTime: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    eventType: {
      type: String,
      required: true,
    }
    ,
    description: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;

/* 
✅ What does { timestamps: true } do?
It automatically adds two fields to your schema:

createdAt – the date and time when the document was first created.

updatedAt – the date and time when the document was last updated.
*/
