import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    meetingHistory: {
        created: [
            {
                meetingId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Meeting',
                }
            }
        ],
        attended: [
            {
                meetingId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Meeting',
                }
            }
        ]
    }
});

const User = mongoose.model("User", userSchema);
export default User;