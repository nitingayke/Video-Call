import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from 'react-router-dom';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { socket } from '../services/socket.js';


export default function ScheduleRoom({ loginUser, handleSnackbar, handleIsLoading }) {

    const navigate = useNavigate();

    const [inputValues, setInputValues] = useState({
        name: loginUser?.name || "",
        meetingTitle: "",
        meetingID: "",
        meetingPassword: "",
        duration: "",
    });

    useEffect(() => {
        const handleScheduleMeetingSuccess = ({ status, meetingID, meetingTitle }) => {
            if (status) {
                const updatedTitle = meetingTitle?.split(" ").join("-");
                navigate(`/meeting-room/${meetingID}/${updatedTitle}`, { state: { organizer: true } });
            }
        }

        socket.on('schedule-meeting-success', handleScheduleMeetingSuccess);

        return () => {
            socket.off('schedule-meeting-success', handleScheduleMeetingSuccess);
        }
    }, []);

    const [isHidePassword, setIsHidePassword] = useState(true);

    const handleOnchangeEvent = (e) => {
        const { name, value } = e.target;

        if (name === "duration" && value > 6) {
            document.querySelector(".display-error").innerText = "Duration is too long. Set it to less than 6 hours.";
            handleSnackbar(true, "Duration is too long. Set it to less than 6 hours.")
            return;
        }

        if (name === "duration" && value < 0) {
            document.querySelector(".display-error").innerText = "Duration cannot be negative.";
            handleSnackbar(true, "Duration cannot be negative.");
            return;
        }

        setInputValues((prev) => ({
            ...prev,
            [name]: value,
        }));
        document.querySelector(".display-error").innerText = "";
    };

    const handleCreateNewMeeting = async () => {

        const { name, meetingTitle, meetingID, meetingPassword, duration } = inputValues;

        if (!name.trim() || !meetingTitle.trim() || !meetingID.trim() || !meetingPassword.trim() || !duration) {
            document.querySelector(".display-error").innerText = "Please fill out all fields.";
            handleSnackbar(true, "Please fill out all fields.");
            return;
        }

        if (!loginUser) {
            handleSnackbar(true, "Please login first.");
            return;
        }

        socket.emit('schedule-meeting', {
            name: name.trim(),
            username: loginUser?.username,
            meetingTitle: meetingTitle.trim(),
            meetingID: meetingID.trim(),
            meetingPassword: meetingPassword.trim(),
            duration
        });
    };

    const handleMeetingCredentials = () => {
        const { meetingID, meetingTitle, meetingPassword } = inputValues;
        const message = `Meeting Details:
            - Title: ${meetingTitle}
            - ID: ${meetingID}
            - Password: ${meetingPassword}

            Join the meeting: http://localhost:5173/join-meeting `;

        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappURL, '_blank');
    };


    return (
        <div className='flex-1 p-4 md:px-10 text-center'>
            <h1 className='text-3xl text-green-500 font-semibold py-5'>Schedule New Meeting</h1>

            <div className='flex flex-wrap'>
                <div className='space-y-5 md:w-3/3 lg:w-1/2 mx-auto md:border md:px-2 py-5 rounded'>
                    <p className='display-error text-red-500'></p>
                    <TextField
                        label="Your Name"
                        size="small"
                        className='w-full'
                        name='name'
                        value={inputValues.name}
                        onChange={handleOnchangeEvent}
                    />

                    <TextField
                        label="Meeting Title"
                        size="small"
                        className='w-full'
                        name='meetingTitle'
                        value={inputValues.meetingTitle}
                        onChange={handleOnchangeEvent}
                    />

                    <div>
                        <TextField
                            label="Meeting ID"
                            placeholder='Create Unique ID'
                            size="small"
                            className='w-full'
                            name='meetingID'
                            value={inputValues.meetingID}
                            onChange={handleOnchangeEvent}
                        />
                        <button
                            className='flex ps-1 text-gray-400 hover:text-green-600'
                            onClick={() => setInputValues((prev) => ({ ...prev, meetingID: uuidv4() }))}>
                            Generate Unique ID
                        </button>
                    </div>

                    <div>
                        <TextField
                            label="Meeting Password"
                            size="small"
                            className='w-full'
                            name='meetingPassword'
                            type={isHidePassword ? "password" : "text"}
                            value={inputValues.meetingPassword}
                            onChange={handleOnchangeEvent}
                        />
                        <div className='w-full flex justify-end'>
                            <button
                                className='flex justify-end text-gray-400 hover:text-green-600 text-sm'
                                onClick={() => setIsHidePassword(!isHidePassword)}>
                                {isHidePassword ? "Show Password" : "Hide Password"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <TextField
                            label="Duration"
                            placeholder='e.g., 1.5 hours, 5 hours'
                            size="small"
                            type='number'
                            className='w-full'
                            name='duration'
                            value={inputValues.duration}
                            onChange={handleOnchangeEvent}
                        />
                        <p className='flex p-1 text-gray-400'>{inputValues.duration * 60} minutes</p>
                    </div>

                    <Button
                        type='button'
                        variant="outlined"
                        className='text-green-500 border-red-500'
                        style={{ border: "1px solid orange", color: "orange" }}
                        onClick={handleCreateNewMeeting}>
                        Create Meeting
                    </Button>
                </div>
                {
                    (inputValues?.meetingTitle && inputValues?.meetingID && inputValues?.meetingPassword) && <div className='h-fit mx-auto border p-5 rounded md:w-1/3 text-start'>
                        <h1 className='text-gray-500 font-semibold'>Meeting Title</h1>
                        <p className='pb-2 text-blue-900'>{inputValues?.meetingTitle}</p>
                        <h1 className='text-gray-500 font-semibold'>Meeting ID</h1>
                        <p className='pb-2 text-blue-900'>{inputValues?.meetingID}</p>
                        <h1 className='text-gray-500 font-semibold'>Meeting Password</h1>
                        <p className='pb-2 text-blue-900'>{inputValues?.meetingPassword}</p>

                        <div className='flex justify-end w-full'>
                            <button onClick={handleMeetingCredentials} className='border p-1 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200'><ShareOutlinedIcon className='text-green-500' /></button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}
