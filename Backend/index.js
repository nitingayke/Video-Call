import express from "express";
import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { connectToSocket } from "./routeControllers/socketManager.js";
import authRoutes from './routes/authRoutes.js';
import meetingRoutes from "./routes/meetingRoutes.js";
import applicationRoutes from "./routes/applicationRoute.js";

const app = express();
const server = createServer(app);
const { MONGO_URL } = process.env;

const port = process.env.PORT || '8000';

connectToSocket(server);

app.use(cookieParser()); 

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use(express.json());

app.use('/application', applicationRoutes);

app.use('/auth', authRoutes);

app.use("/meeting", meetingRoutes);

app.get("*", (req, res) => {
    return res.send({ status: `does not contain ${req.originalUrl}` });
});

app.use((err, req, res, next) => {

    res.status(err.status || 500).json({
        status: false,
        message: err.message || "Internal Server Error",
    });
});


const startServer = async () => {

    try {
        const connectionDB = await mongoose.connect(MONGO_URL);
        console.log(`mongodb connected on host: ${connectionDB.connection.host}`);
    } catch (error) {
        console.log(error.message || "MongoDB not connect");
    }

    

    server.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
};

startServer();
