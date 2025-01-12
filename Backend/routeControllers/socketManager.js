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
        console.log("a user connected to socket");

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

        socket.on("join-meeting", async ({ meetingID, meetingPassword, user_id }) => {

            try {
                if (!meetingID || !meetingPassword || !user_id) {
                    return socket.emit('error', { message: "Missing required fields" });
                }

                if (!connections[meetingID]) {
                    return socket.emit('error', { message: "Meeting not found or has ended." });
                }

                if (connections[meetingID].length >= 4) {
                    return socket.emit('error', { message: 'Meeting is full. Limit is 4 participants.' });
                }

                const user = await getUserData(user_id);
                const meeting = await getMeetingData(meetingID);

                if (!meeting) {
                    return socket.emit('error', { message: "Meeting not found, please try again." });
                }
                if (!user) {
                    return socket.emit('error', { message: "User not found, please try again." });
                }

                if (!meeting.joinUsers.includes(user_id)) {
                    meeting.joinUsers.push(user_id);
                    await meeting.save();
                }

                user.meetingHistory.attended.addToSet({ meetingId: meeting._id });
                await user.save();

                connections[meetingID].forEach((socketId) => {
                    io.to(socketId).emit("meeting-notification", { message: `${user.username} joined the meeting.` });
                });

                if (!connections[meetingID].includes(socket.id)) {
                    connections[meetingID].push(socket.id);
                }

                socket.emit('join-meeting-success', { status: true, meetingTitle: meeting.title, meetingId: meetingID });
            } catch (error) {
                console.log(error);
                socket.emit('error', { message: error.message || 'An error occurred while joining the meeting.' });
            }
        });

        socket.on("leave-meeting", async ({ meetingId, username }) => {
            try {
                if (!connections[meetingId]) {
                    return socket.emit('error', { message: "Meeting not found or already ended." });
                }

                const meeting = await getMeetingData(meetingId);
                if (!meeting) {
                    return socket.emit('meeting-notification', { message: "Meeting not found in the database." });
                }

                if (meeting.user === username) {

                    connections[meetingId].forEach(socketId => {
                        io.to(socketId).emit('meeting-notification', {
                            message: "The meeting creator has left. The meeting is now closed."
                        });
                        io.to(socketId).emit('leave-meeting-success', { status: true });
                    });

                    delete connections[meetingId];
                    return;
                }

                connections[meetingId] = connections[meetingId].filter(id => id !== socket.id);

                connections[meetingId].forEach(socketId => {
                    io.to(socketId).emit('meeting-notification', { message: `${username} has left the meeting.` });
                });

                socket.emit('leave-meeting-success', { status: true, message: "You have left the meeting." });


                if (connections[meetingId].length === 0) {
                    delete connections[meetingId];
                }
            } catch (error) {
                socket.emit('meeting-notification', {
                    message: error?.message || "An error occurred while leaving the meeting."
                });
            }
        });

        socket.on("validate-participation", async ({ meetingId, user_id }) => {
            try {
                const meeting = await Meeting.findOne({ meetingId });
                if (!meeting) {
                    return socket.emit('error', { message: "Meeting not found." });
                }

                const user = await User.findOne({ _id: user_id });
                if (!user) {
                    return socket.emit('error', { message: 'User not found.' });
                }

                const wasParticipant = meeting.joinUsers.includes(user._id);

                if (wasParticipant && connections[meetingId]) {
                    if (!connections[meetingId].includes(socket.id)) {
                        connections[meetingId].push(socket.id);
                    }

                    return socket.emit('validation-success', { message: 'You have rejoined the meeting.' });
                } else {
                    return socket.emit('validation-failed', { message: 'You are no longer part of this meeting or has ended.' });
                }
            } catch (error) {
                socket.emit('error', { message: error.message || 'An error occurred during validation.' });
            }
        });

        socket.on('meeting-message', async ({ meetingId, username, message }) => {
            try {

                if (!meetingId || !username || !message) {
                    return socket.emit('meeting-notification', {
                        message: `Required fields not found. Please provide meetingId, username, and message.`
                    });
                }

                const meeting = await Meeting.findOne({ meetingId });
                if (!meeting || !connections[meetingId]) {
                    return socket.emit('meeting-notification', {
                        message: 'meeting not found, please try again.'
                    });
                }

                meeting.message.push({ user: username, message });
                await meeting.save();

                connections[meetingId].forEach(socketId => {
                    console.log(username + "  " + message)
                    io.to(socketId).emit('meeting-message-success', {
                        username,
                        message
                    });
                });

                socket.emit('meeting-notification', { message: "Message sent successfully!" });
            } catch (error) {
                socket.emit('meeting-notification', { message: 'An error occurred! Cannot send the message.' });
            }
        });

        socket.on("disconnect", () => {

            for(const meetingId of connections) {
                connections[meetingId] = connections[meetingId].filter(id => id !== socket.id);
                socket.to(meetingId).emit('error', { message: "User left meeting.", socketId: socket.id });
            }
            console.log("user disconnected.");
        });
    });
}



export { connectToSocket };