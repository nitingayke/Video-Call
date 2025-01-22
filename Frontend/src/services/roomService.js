import axios from "axios";

const getMeetingData = async (meetingID) => {
    try {
        const response = await axios.get(`https://video-call-server-hxw6.onrender.com/meeting/live-meeting/${meetingID}`);
        return response;
    } catch (error) {
        return { status: false, error: error?.response?.data?.message || "Error to get live meeting" };
    }
}

const getApplicationData = async () => {
    try {
        const response = await axios.get('https://video-call-server-hxw6.onrender.com/application/app-data');
        return response;
    } catch (error) {
        return null;
    }
}

export { getMeetingData, getApplicationData }