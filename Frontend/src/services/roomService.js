import axios from "axios";

const createNewMeeting = async (name, meetingTitle, meetingID, meetingPassword, duration, username) => {
    try {
        const response = await axios.post("http://localhost:8000/meeting/schedule-meeting", {
            name,
            meetingTitle,
            meetingID,
            meetingPassword,
            duration,
            username
        });

        return response;
    } catch (error) {
        return { status: false, error: error?.response?.data?.message || "Unable to create new meeting." };
    }
}

const joinNewUserMeeting = async (meetingID, meetingPassword, username, user_id) => {
    try {
        const response = await axios.post('http://localhost:8000/meeting/join-user', {
            meetingID,
            meetingPassword,
            username,
            user_id
        });

        return response;
    } catch (error) {
        return { status: false, error: error?.response?.data?.message || "Unable to join meeting." };
    }
}

const getMeetingData = async (meetingID) => {
    try {
        const response = await axios.get(`http://localhost:8000/meeting/live-meeting/${meetingID}`);
        return response;
    } catch (error) {
        return { status: false, error: error?.response?.data?.message || "Error to get live meeting" };
    }
}

export { createNewMeeting, joinNewUserMeeting, getMeetingData }