import User from "../Model/userModel.js";
import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status';

import jwt from "jsonwebtoken";

const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ status: false, message: "please enter credential." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(httpStatus.CONFLICT).json({
            status: false,
            message: "User already exists.",
        });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);
    const newUser = new User({
        name,
        username,
        password: hashedPassword,
    });

    await newUser.save();
    return res.status(httpStatus.OK).json({ status: true, message: "User registered successfully.", });
}

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username) {
        return res.status(httpStatus.BAD_REQUEST).json({
            status: false,
            message: "User not found",
        });
    }

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
            status: false,
            message: "User not found",
        });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            status: false,
            message: "Invalid password.",
        });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(httpStatus.OK).json({
        status: true,
        user: {
            username: user.username,
            name: user.name,
            meetingHistory: user.meetingHistory,
        },
        token,
        message: "User logged in successfully.",
    });
}

const getUserProfile = async (req, res) => {

    const { token } = req.body;

    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({ status: false, message: "User not found." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ username: decoded.username })
        .populate({
            path: 'meetingHistory.created.meetingId',
            populate: {
                path: 'joinUsers',
                select: 'name username',
            },
        })
        .populate({
            path: 'meetingHistory.attended.meetingId',
            populate: {
                path: 'joinUsers',
                select: 'name username',
            },
        });

    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({ status: false, message: "User not found." });
    }

    return res.status(httpStatus.OK).json({
        status: true,
        user: {
            _id: user._id,
            username: user.username,
            name: user.name,
            meetingHistory: user.meetingHistory,
        },
        message: "User logged in successfully.",
    });
}


export { register, login, getUserProfile }; 