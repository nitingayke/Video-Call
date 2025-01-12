import { Router } from "express";
import wrapAsync from "../utils/errorHandling.js"
import { getUserProfile, login, register } from "../routeControllers/authController.js";

const router = Router();


router.post("/register", wrapAsync(register));

router.post("/login", wrapAsync(login));

router.post("/user-profile", wrapAsync(getUserProfile));

export default router;