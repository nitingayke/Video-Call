import Meeting from "../Model/meetingModel.js";
import User from "../Model/userModel.js";

const getApplicationData = async(req, res) => {
    const totalUser = await User.find({});
    const totalMeeting = await Meeting.find({});

    return res.status(200).json({ totalUser: totalUser?.length || 0, totalMeeting: totalMeeting?.length || 0 });
}

export { getApplicationData };