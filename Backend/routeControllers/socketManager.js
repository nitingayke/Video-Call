import { Server } from "socket.io";
import { getMeetingData, getUserData } from "../utils/dataHelper.js";
import User from '../model/userModel.js';
import Meeting from "../model/meetingModel.js";

let connections = {};
let maxSize = 2;


const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ['https://video-meeting-nu.vercel.app', 'http://localhost:5173/'],
            methods: ['GET', 'POST']
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

        socket.on("join-meeting", async ({ meetingID, meetingPassword, user_id }) => {
            try {
                if (!meetingID || !meetingPassword || !user_id) {
                    return socket.emit('error', { message: "Missing required fields" });
                }
                if (!connections[meetingID]) {
                    return socket.emit('error', { message: "Meeting not found or has ended." });
                }
                if (connections[meetingID].length >= maxSize) {
                    return socket.emit('error', { message: `Meeting is full. Limit is ${maxSize} participants.` });
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
                    io.to(socketId).emit("new-user-join", { socketId: socket.id, username: user.username });
                });

                if (!connections[meetingID].includes(socket.id)) {
                    connections[meetingID].push(socket.id);
                }
                socket.emit('join-meeting-success', { status: true, meetingTitle: meeting.title, meetingId: meetingID });

            } catch (error) {
                socket.emit('error', { message: error.message || 'An error occurred while joining the meeting.' });
            }
        });

        socket.on('new-user-call', async ({ socketId, offer, username }) => {
            io.to(socketId).emit('new-user-join-call', { offer, from: socket.id, username });
        });

        socket.on('user-call-accepted', ({ to, answer }) => {
            io.to(to).emit('call-accepted-success', {
                from: socket.id,
                answer
            });
        });

        socket.on('peer-nego-needed', ({ offer, to }) => {
            io.to(to).emit('peer-nego-success', { from: socket.id, offer });
        });

        socket.on('peer-nego-done', ({ to, answer }) => {
            io.to(to).emit('peer-nego-done-success', { from: socket.id, answer });
        });

        socket.on('meeting-chat-message', async({ username, meetingId, message }) => {

            if (!username || !message || !meetingId) {
                return socket.emit('meeting-notification', {
                    message: 'Required field not found.'
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
                io.to(socketId).emit('meeting-chat-message-success', {
                    username, 
                    message,
                });
            });
        });

        socket.on('leave-meeting', ({ meetingId, username, streamId }) => {

            if(connections[meetingId]) {
                connections[meetingId] = connections[meetingId].filter((socketId) => socketId !== socket.id);

                connections[meetingId].forEach(socketId => {
                    io.to(socketId).emit('user-left-meeting', { socketId: socket.id, username, streamId });
                });

                return;
            }

            return socket.emit('meeting-notification', {
                message: 'Meeting not found, please try again.'
            });
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