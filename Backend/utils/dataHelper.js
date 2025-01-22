import Meeting from "../model/meetingModel.js";
import User from "../model/userModel.js";

const getUserData = async (user_id) => {
    try {
        const response = await User.findById(user_id);
        return response;
    } catch (error) {
        return null;
    }
}

const getMeetingData = async (meeting_id) => {
    try {
        const response = await Meeting.findOne({ meetingId: meeting_id});
        return response;
    } catch (error) {
        return null;
    }
}


export { getUserData, getMeetingData };