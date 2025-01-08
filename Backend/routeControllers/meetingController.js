import Meeting from "../Model/meetingModel.js";
import httpStatus from "http-status";
import bcryptjs from 'bcryptjs';
import User from "../model/userModel.js";

const scheduleMeeting = async (req, res) => {

    const { name, username, meetingTitle, meetingID, meetingPassword, duration } = req.body;

    if (!name || !username || !meetingTitle || !meetingID || !meetingPassword || !duration) {
        return res.status(httpStatus.BAD_REQUEST).json({ status: false, message: "All fields are required." })
    }

    const user = await User.findOne({ username });
    if(!user) {
        return res.status(httpStatus.BAD_REQUEST).json({ status: false, message: "User not found." }); 
    }

    const hashedPassword = await bcryptjs.hash(meetingPassword, 12);
    const newRoom = new Meeting({
        user: name,
        title: meetingTitle,
        meetingId: meetingID,
        duration: duration,
        password: hashedPassword,
        joinUsers: [user._id],
    });

    await newRoom.save();

    user.meetingHistory.created.push({ meetingId: newRoom._id });
    await user.save();

    return res.status(httpStatus.OK).json({ status: true, message: "New meeting scheduled successfully." });
}

const joinNewUser = async (req, res) => {

    const { meetingID, meetingPassword, username, user_id } = req.body;
    
    if (!meetingID || !meetingPassword || !username || !user_id) {
        return res.status(httpStatus.BAD_REQUEST).json({
            status: false,
            message: "Missing required fields",
        });
    }

    const user = await User.findById(user_id);
    const meeting = await Meeting.findOne({ meetingId: meetingID });

    if (!meeting) {
        return res.status(httpStatus.NOT_FOUND).json({
            status: false,
            message: "Meeting not found"
        });
    }
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
            status: false,
            message: "User not found"
        });
    }

    const isCorrectPassword = await bcryptjs.compare(meetingPassword, meeting.password);
    if (!isCorrectPassword) {
        return res.status(httpStatus.UNAUTHORIZED).json({ status: false, message: "Wrong meeting password" });
    }

    if (!meeting.joinUsers.includes(user_id)) {
        meeting.joinUsers.push(user_id);
        await meeting.save();
    }

    return res.status(httpStatus.OK).json({ 
        status: true, 
        meetingTitle: meeting.title,
    });
}

const getLiveMeeting = async (req, res) => {
    const { meetingID } = req.params;

    if(!meetingID){
        return res.status(httpStatus.BAD_REQUEST).json({status: false, message: "Meeting id not found"});
    }

    const currMeeting = await Meeting.findOne({ meetingId: meetingID });

    if(!currMeeting) {
        return res.status(httpStatus.NOT_FOUND).json({ status: false, message: "Meeting not found"});
    }

    return res.status(httpStatus.OK).json({ currMeeting });
}

export { scheduleMeeting, joinNewUser, getLiveMeeting };