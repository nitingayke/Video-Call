import { Router } from "express";
import wrapAsync from "../utils/errorHandling.js";
import { getApplicationData } from "../routeControllers/applicationController.js";

const route = Router();

route.get('/app-data', wrapAsync(getApplicationData));


export default route;