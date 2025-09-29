import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true
    },
    className: {
      type: String,
      required: true,
      trim: true
    },
    courseId: {
      type: String,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    teacherEmail: {
      type: String,
      trim: true
    },
    enrollmentCode: {
      type: String,
      trim: true
    },
    courseState: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED', 'PROVISIONED', 'DECLINED', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    alternateLink: {
      type: String,
      trim: true
    },
    students: [{
      name: String,
      email: String,
      userId: String
    }],
    teachers: [{
      name: String,
      email: String,
      userId: String
    }]
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;

/* 
✅ What does { timestamps: true } do?
It automatically adds two fields to your schema:

createdAt – the date and time when the document was first created.

updatedAt – the date and time when the document was last updated.
*/