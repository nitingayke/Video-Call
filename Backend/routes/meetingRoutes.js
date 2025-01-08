import { Router } from "express";
import wrapAsync from "../utilErrors/errorHandling.js";
import { getLiveMeeting, joinNewUser, scheduleMeeting } from "../routeControllers/meetingController.js";

const router = Router();

router.post("/schedule-meeting", wrapAsync(scheduleMeeting));

router.post('/join-user', wrapAsync(joinNewUser));

router.get("/live-meeting/:meetingID", wrapAsync(getLiveMeeting));


export default router;