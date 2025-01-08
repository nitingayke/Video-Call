import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  meetingId: {
    type: String,
    required: true,
    unique: true
  },
  duration: {
    type: Number,
    default: 1,
  },
  password: {
    type: String,
    required: true,
  },
  joinUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  ],
  message: [
    { 
      user: {
        type: String,
        require: true,
      },
      message: {
        type: String,
        required: true,
      },
    },
  ],
}, { timestamps: true });

const Meeting = mongoose.model("Meeting", meetingSchema);
export default Meeting; 
