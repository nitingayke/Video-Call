import { Router } from "express";
import wrapAsync from "../utils/errorHandling.js";
import { getLiveMeeting } from "../routeControllers/meetingController.js";

const router = Router();

router.get("/live-meeting/:meetingID", wrapAsync(getLiveMeeting));


export default router;