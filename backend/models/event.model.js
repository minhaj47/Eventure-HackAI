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
    },
    registrationFormUrl: {
      type: String,
      trim: true
    },
    registrationFormEditUrl: {
      type: String,
      trim: true
    },
    attendeeSheetUrl: {
      type: String,
      trim: true
    },
    className: {
      type: String,
      trim: true
    },
    classroomcode: {
      type: String,
      trim: true
    },
    classroomlink: {
      type: String,
      trim: true
    },
    googleMeets: [{
      meetingTitle: {
        type: String,
        trim: true
      },
      meetingUrl: {
        type: String,
        trim: true
      },
      meetingId: {
        type: String,
        trim: true
      },
      calendarLink: {
        type: String,
        trim: true
      },
      calendarEventId: {
        type: String,
        trim: true
      },
      editorEmail: {
        type: String,
        trim: true
      },
      startDateTime: {
        type: Date
      },
      endDateTime: {
        type: Date
      },
      createdBy: {
        type: String,
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
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
