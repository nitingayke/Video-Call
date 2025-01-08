import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MicIcon from '@mui/icons-material/Mic';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import PresentToAllOutlinedIcon from '@mui/icons-material/PresentToAllOutlined';
import CallEndOutlinedIcon from '@mui/icons-material/CallEndOutlined';
import Tooltip from '@mui/material/Tooltip';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import CancelPresentationOutlinedIcon from '@mui/icons-material/CancelPresentationOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import { getMeetingData } from '../services/roomService.js';
import { fetchLoginUserProfile } from '../services/authService.js';
import { socket } from '../services/socket.js';

export default function MeetingRoom({ loginUser, handleSnackbar }) {

    const navigate = useNavigate();

    const { meetingId, title } = useParams();

    const [isLoading, setIsLoading] = useState(false);
    const [currMeeting, setCurrMeeting] = useState(null);

    useEffect(() => {
        const handleGetCurrLiveMeeting = async () => {

            try {
                setIsLoading(true);

                const response = await getMeetingData(meetingId);

                if (response.status === 200) {
                    setCurrMeeting(response.data.currMeeting);

                    const userLogin = await fetchLoginUserProfile();

                    if (!userLogin.status !== 200 && !response?.data?.currMeeting?.joinUsers.includes(userLogin?.data?.user?._id)) {
                        handleSnackbar(true, 'You are not a participant in the current meeting. Please join again.');
                        navigate("/join-meeting");
                    }
                } else {
                    handleSnackbar(true, response?.error || 'Unable to find current meeting');
                }
            } catch (error) {
                handleSnackbar(true, error?.message || 'Unable to find current meeting');
            } finally {
                setIsLoading(false);
            }
        }

        handleGetCurrLiveMeeting();
    }, []);


    const [isMutedMic, setIsMutedMic] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isShareScreen, setIsShareScreen] = useState(false);

    
    const mediaStream = useRef(null);
    
    const localVideoRef = useRef(null);
    const [remoteVideoRefs, setRemoteVideoRefs] = useState([]);
    const peerConnections = useRef({});
    const localSream = useRef(null);


 
    useEffect(() => {

        if (isVideoOn) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }) 
                .then((stream) => {
                    mediaStream.current = stream;

                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                })
                .catch((err) => {
                    handleSnackbar(true, `Error accessing media devices: ${err.message}`);
                })
        } else {
            handleSnackbar(true, `Please on your camara${isMutedMic ? " and mic." : "."}`);
            if (mediaStream.current) {
                mediaStream.current.getTracks().forEach(track => {
                    if (track.kind === 'video') {
                        track.stop();
                    }
                });

                mediaStream.current = null;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = null;
                }
            }
        }

        return () => {
            if (mediaStream.current) {
                mediaStream.current.getTracks().forEach((track) => track.stop());
            }
        }
    }, [isVideoOn]);

 
    const [userMessage, setUserMessage] = useState("");
    const handleMessageSubmit = async (e) => {
        e.preventDefault();

        if (!userMessage) {
            handleSnackbar(true, `Please enter text.`);
            return;
        }

        currMeeting.message.unshift({ user: loginUser?.username, message: userMessage });
        setUserMessage("");
    }

 
    const handleLeaveMeeting = () => {
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach((track) => track.stop());
        }
    };


    return (
        <>
            {
                isLoading && <div className='absolute flex flex-col justify-center items-center h-screen w-full z-10'>
                    <CircularProgress size="3rem" />
                </div>
            }

            <div className='h-screen bg-gray-800 flex flex-col'>
                {/* Leave meeting */}
                <div className='flex align-items-center justify-end p-4'>
                    <button className="px-3 py-1 text-white">Total Users <span className="ps-1">{currMeeting?.joinUsers?.length || 0}</span></button>
                    <button
                        onClick={handleLeaveMeeting}
                        className='border-2 border-red-500 hover:bg-red-500 hover:text-white font-semibold text-red-500 px-3 py-1 rounded-full'
                    >
                        Leave Meeting
                    </button>
                </div>


                <div className='flex-1 flex flex-wrap md:flex-nowrap overflow-hidden px-4 text-white'>
                    {
                        !currMeeting
                            ? <div className='text-center my-auto space-y-2 w-full'>
                                <p>Meeting Title <span>{title}</span></p>
                                <p>Meeting ID <span>{meetingId}</span></p>

                                <p className='text-gray-500'>Current Live Meeting Not Found, Please Try Again.</p>
                            </div>
                            : <div className='flex flex-wrap'>
                                <div className="grid grid-cols-2 lg:grid-cols-3 md:h-full overflow-auto md:w-3/5 lg:w-3/4" >
                                    <div className="p-2">
                                        <video ref={localVideoRef} autoPlay muted={isMutedMic} className="rounded-2xl"></video>
                                    </div>
                                </div>

                                {/* user message */}
                                <div className='md:w-2/5 lg:w-1/4 md:ps-2 h-full hidden md:block'>
                                    <div className='flex flex-col border border-gray-600 rounded-xl p-2 h-full relative '>
                                        <ul className='flex-1 overflow-auto'>
                                            {
                                                currMeeting?.message.map((message, idx) => (
                                                    <li key={idx} className='bg-gray-700 py-1 px-2 rounded mb-2' >
                                                        <h1 className='text-lg font-semibold'>{message.user}</h1>
                                                        <p className='text-gray-300'>{message.message}</p>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                        <form onSubmit={handleMessageSubmit} className="mt-2 border border-gray-500 bg-gray-800 rounded-lg flex items-center sticky left-0 bottom-0">
                                            <input
                                                type="text"
                                                className="bg-transparent p-1 flex-grow placeholder-gray-500 outline-0 min-w-14"
                                                placeholder="Enter message..."
                                                onChange={(e) => setUserMessage(e.target.value)}
                                                value={userMessage}
                                            />
                                            <button className={`p-1 text-sm me-1 ${!userMessage ? "text-gray-500" : "text-white"}`} type="submit">
                                                Send
                                            </button>
                                        </form>

                                    </div>
                                </div>
                            </div>
                    }
                </div>

                {/* room meeting buttons */}
                <div className='w-full flex justify-center p-4'>
                    <ul className='flex space-x-5'>
                        <li>
                            <button onClick={() => setIsMutedMic(!isMutedMic)} className='bg-gray-700 text-white w-10 h-10 rounded-full'>
                                {!isMutedMic
                                    ? <Tooltip title="Mute"><MicIcon className="text-green-400" /></Tooltip>
                                    : <Tooltip title="Unmute"><MicOffIcon /></Tooltip>
                                }
                            </button>
                        </li>
                        <li>
                            <button onClick={() => setIsVideoOn(!isVideoOn)} className='bg-gray-700 text-white w-10 h-10 rounded-full'>
                                {isVideoOn
                                    ? <Tooltip title="Turn Off Video"><VideocamOutlinedIcon className="text-green-400" /></Tooltip>
                                    : <Tooltip title="Turn On Video"><VideocamOffOutlinedIcon /></Tooltip>
                                }
                            </button>
                        </li>
                        <li>
                            <button onClick={() => setIsShareScreen(!isShareScreen)} className='bg-gray-700 text-white w-10 h-10 rounded-full'>
                                {isShareScreen
                                    ? <Tooltip title="Stop Sharing"><PresentToAllOutlinedIcon className="text-green-400" /></Tooltip>
                                    : <Tooltip title="Share Screen"><CancelPresentationOutlinedIcon /></Tooltip>
                                }
                            </button>
                        </li>
                        <li>
                            <Tooltip title="Leave Meeting">
                                <button
                                    onClick={handleLeaveMeeting}
                                    className='bg-red-500 text-white border-2 border-red-600 w-14 h-10 rounded-3xl hover:bg-transparent hover:text-red-500'
                                >
                                    <CallEndOutlinedIcon />
                                </button>
                            </Tooltip>
                        </li>
                    </ul>
                </div>

            </div>
        </>
    );
}
