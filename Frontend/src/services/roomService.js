import axios from "axios";

const getMeetingData = async (meetingID) => {
    try {
        const response = await axios.get(`http://localhost:8000/meeting/live-meeting/${meetingID}`);
        return response;
    } catch (error) {
        return { status: false, error: error?.response?.data?.message || "Error to get live meeting" };
    }
}

const getApplicationData = async () => {
    try {
        const response = await axios.get('http://localhost:8000/application/app-data');
        return response;
    } catch (error) {
        return null;
    }
}

export { getMeetingData, getApplicationData }