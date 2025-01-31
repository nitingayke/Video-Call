import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';

export default function JoinRoom({ loginUser, handleSnackbar }) {

    const navigate = useNavigate();

    const [isHidePassword, setIsHidePassword] = useState(true);

    const [inputValues, setInputValues] = useState({ meetingID: "", meetingPassword: ""});

    const handleInputValues = (e) => {
        const { value, name } = e.target;

        setInputValues((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    const handleJoinMeeting = async () => {

        if (!loginUser?._id) {
            return handleSnackbar(true, "You need to login.");
            
        }

        const { meetingID, meetingPassword } = inputValues;
        if (!meetingID || !meetingPassword) {
            return handleSnackbar(true, 'Please fill in all fields.');
        }

        if (!socket.connected) {
            return handleSnackbar(true, 'Server not connected. please try again.');
        }
        
        socket.emit('join-meeting', {
            meetingID,
            meetingPassword,
            user_id: loginUser?._id,
        });
    }

    useEffect(() => {

        const handleJoinMeetingSuccess = ({ meetingTitle, meetingId }) => {
            const updatedTitle = meetingTitle.split(" ").join("-");
            navigate(`/meeting-room/${meetingId}/${updatedTitle}`, { state: { organizer: false } });
        };
        
        socket.on('join-meeting-success', handleJoinMeetingSuccess);

        return () => {
            socket.off('join-meeting-success', handleJoinMeetingSuccess);
        }
    }, [socket, navigate, handleSnackbar]);

    return (
        <div className='flex-1 p-4 md:p-10 text-center'>
            <h1 className='text-3xl font-bold text-green-500 '>Join Meeting</h1>

            <div className='space-y-4 py-5 md:w-2/3 lg:w-1/2 mx-auto border rounded px-2 my-5'>
                <TextField
                    label="Meeting ID"
                    size="small"
                    className='w-full'
                    name='meetingID'
                    value={inputValues.meetingID}
                    onChange={handleInputValues}
                />
                <div>
                    <TextField
                        label="Meeting Password"
                        size="small"
                        className='w-full'
                        name='meetingPassword'
                        type={isHidePassword ? "password" : "text"}
                        value={inputValues.meetingPassword}
                        onChange={handleInputValues}
                    />
                    <div className='w-full flex justify-end pt-1'>
                        <button
                            className='flex justify-end text-gray-400 hover:text-green-600 text-sm'
                            onClick={() => setIsHidePassword(!isHidePassword)}>
                            {isHidePassword ? "Show Password" : "Hide Password"}
                        </button>
                    </div>
                </div>

                <Button
                    type='button'
                    variant="outlined"
                    className='text-green-500 border-red-500'
                    style={{ border: "1px solid orange", color: "orange" }}
                    onClick={handleJoinMeeting}>
                    Join Meeting
                </Button>

            </div>
        </div>
    )
}