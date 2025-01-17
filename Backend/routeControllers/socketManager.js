import { Server } from "socket.io";
import { getMeetingData, getUserData } from "../utils/dataHelper.js";
import User from "../model/userModel.js";
import Meeting from "../Model/meetingModel.js";

let connections = {};

const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            // origin: 'http://localhost:5173',
            // methods: ['GET', 'POST']
            origin: '*',
        }
    });

    io.on("connection", (socket) => {
        console.log(`a user connected to socket ${socket.id}`);

        socket.on('schedule-meeting', async ({ username, meetingTitle, meetingID, meetingPassword, duration }) => {

            if (!username || !meetingTitle || !meetingPassword || !meetingID || !duration) {
                return socket.emit('error', { status: false, message: 'Invalid input data' });
            }

            try {
                const user = await User.findOne({ username });
                if (!user) {
                    return socket.emit('error', { status: false, message: 'User not found' });
                }

                const newRoom = new Meeting({
                    user: username,
                    title: meetingTitle,
                    meetingId: meetingID,
                    duration: duration,
                    password: meetingPassword,
                    joinUsers: [user._id],
                });

                await newRoom.save();

                user.meetingHistory.created.push({ meetingId: newRoom._id });
                await user.save();

                connections[meetingID] = [socket.id];

                socket.emit('schedule-meeting-success', { status: true, meetingID, meetingTitle });
            } catch (error) {
                return socket.emit('error', { status: false, message: error.message || 'An error occurred while scheduling the meeting.' });
            }
        });

        socket.on("disconnect", () => {
            if (connections) {
                for (const meetingId of Object.keys(connections)) {
                    connections[meetingId] = connections[meetingId].filter(id => id !== socket.id);

                    if (connections[meetingId].length === 0) {
                        delete connections[meetingId];
                    }
                }
            }
            console.log("user disconnected.");
        });
    });
}



export { connectToSocket };