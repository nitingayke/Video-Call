import Meeting from "../Model/meetingModel.js";
import httpStatus from "http-status";

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

export { getLiveMeeting };