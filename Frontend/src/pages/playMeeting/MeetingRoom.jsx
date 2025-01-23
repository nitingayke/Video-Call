import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getMeetingData } from '../../services/roomService';
import { socket } from '../../services/socket';

import CircularProgress from '@mui/material/CircularProgress';
import MeetingButtons from './MeetingButtons';
import ReactPlayer from 'react-player'
import DisplayTime from '../../components/DisplayTime';
import peerService from '../../services/peer.js';


export default function MeetingRoom({ loginUser, handleSnackbar }) {

    const { meetingId, title } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const myStreamRef = useRef(null);

    const [localMeeting, setLocalMeeting] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState([]);
    const [remoteSocketData, setRemoteSocketData] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isJoinMeeting, setIsJoinMeeting] = useState(false);
    const [meetingMessage, setMeetingMessage] = useState("");
    const [buttonState, setButtonState] = useState({ isMuteOn: false, isVideoOn: true, isShareOn: false });


    const handleMeetingNotification = ({ message }) => {
        handleSnackbar(true, message);
    }

    const handleNewChatMessage = ({ username, message }) => {
        setLocalMeeting((prev) => ({
            ...prev,
            message: [{ user: username, message }, ...prev?.message],
        }));

        if (username === loginUser?.username) {
            handleSnackbar(true, `Message sent successfully.`);
        } else {
            handleSnackbar(true, `${username} sent a message.`);
        }
        setMeetingMessage("");
    }

    const handleRemoteUser = async ({ socketId, username }) => {

        setRemoteSocketData((prev) => ([...prev, { socketId, username }]));

        handleSnackbar(true, `${username} joined the meeting.`);
        const offer = await peerService.getOffer();
        socket.emit('new-user-call', { socketId, offer, username: loginUser?.username || "Untitle" });
    };

    const handleUserJoinCall = async ({ offer, from, username }) => {
        setRemoteSocketData((prev) => [...prev, { socketId: from, username }]);

        const answer = await peerService.getAnswer(offer);
        socket.emit('user-call-accepted', { to: from, answer });
    };

    const sendStreams = () => {
        try {
            myStream.getAudioTracks().forEach(track => {
                peerService.peer.addTrack(track, myStream);
            });
            myStream.getVideoTracks().forEach(track => {
                peerService.peer.addTrack(track, myStream);
            });
        } catch (error) {
            handleSnackbar(true, error.message || 'error occured, please try again.')
        }
    }


    const handleCallAcceptedSuccess = async ({ from, answer }) => {
        await peerService.setLocalDescription(answer);
        sendStreams();
    }

    const handleNegoNeedIncomming = async ({ from, offer }) => {
        const answer = await peerService.getAnswer(offer);
        socket.emit('peer-nego-done', { to: from, answer });
    }

    const handleNegoDoneSuccess = async ({ from, answer }) => {
        await peerService.setLocalDescription(answer);
    }

    const handleUserLeft = ({ socketId, streamId, username }) => {

        try {

            remoteStream((prev) => prev.filter((stream) => stream.id !== streamId));
            setRemoteSocketData((prev) => prev.filter((data) => data.username !== username))
            handleSnackbar(true, `${username} left the meeting`);

        } catch (error) {
            handleSnackbar(true, error.message || 'Error in updating remote stream.');
        }
    }

    useEffect(() => {

        socket.on('meeting-notification', handleMeetingNotification);
        socket.on('meeting-chat-message-success', handleNewChatMessage);
        socket.on('user-left-meeting', handleUserLeft);

        socket.on('new-user-join', handleRemoteUser);
        socket.on('new-user-join-call', handleUserJoinCall);
        socket.on('call-accepted-success', handleCallAcceptedSuccess);
        socket.on('peer-nego-success', handleNegoNeedIncomming);
        socket.on('peer-nego-done-success', handleNegoDoneSuccess);

        return () => {
            socket.off('meeting-notification', handleMeetingNotification);
            socket.off('meeting-chat-message-success', handleNewChatMessage);
            socket.off('user-left-meeting', handleUserLeft);

            socket.off('new-user-join', handleRemoteUser);
            socket.off('new-user-join-call', handleUserJoinCall);
            socket.off('call-accepted-success', handleCallAcceptedSuccess);
            socket.off('peer-nego-success', handleNegoNeedIncomming);
            socket.off('peer-nego-done-success', handleNegoDoneSuccess);
        }
    }, [myStream]);

    const handleTrackEvent = (e) => {
        const remoteStrm = e.streams[0];
        setRemoteStream((prev) => {
            const exists = prev.some((stream) => stream.id === remoteStrm.id);
            if (!exists) {
                return [...prev, remoteStrm];
            }
            return prev;
        });
    }

    const handleNegoNeede = async () => {
        const offer = await peerService.getOffer();
        remoteSocketData.forEach(socketData => {
            socket.emit('peer-nego-needed', { offer, to: socketData.socketId });
        });
    }

    useEffect(() => {

        peerService.peer.addEventListener('track', handleTrackEvent);
        peerService.peer.addEventListener('negotiationneeded', handleNegoNeede, { once: true });

        return () => {
            if (peerService.peer) {
                peerService.peer.removeEventListener('track', handleTrackEvent);
                peerService.peer.removeEventListener('negotiationneeded', handleNegoNeede);
            }
        }
    }, [remoteSocketData, socket]);

    const handleMediaDevicesOn = async () => {

        try {
            setIsLoading(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });

            myStreamRef.current = stream;
            setMyStream(stream);
        } catch (error) {
            if (error.name === "NotFoundError") {
                handleSnackbar(true, "No camera or microphone found.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleMediaDevicesOff = async () => {

        try {

            myStreamRef.current.getTracks().forEach(track => {
                if (track.kind === 'video') {
                    track.stop();
                }
            });

            myStreamRef.current = null;
            setMyStream(null);

        } catch (error) {
            handleSnackbar(true, error.message || "Error stopping the stream.")
        }
    }

    const getLocalMeetingData = async () => {
        try {
            setIsLoading(true);
            const response = await getMeetingData(meetingId);

            if (response.status === 200) {
                setLocalMeeting({
                    ...response.data.currMeeting,
                    message: response.data.currMeeting.message.reverse(),
                });
            } else {
                handleSnackbar(true, response?.error || 'Unable to find current meeting');
            }
        } catch (error) {
            handleSnackbar(true, error?.message || 'Unable to find current meeting');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getLocalMeetingData();
        handleMediaDevicesOn();

        return () => {
            if (myStreamRef.current) {
                myStreamRef.current.getTracks().forEach((track) => track.stop());
            }
        }
    }, [loginUser]);

    useEffect(() => {
        setIsJoinMeeting(location.state?.organizer);
    }, [loginUser, meetingId]);

    const handleLeaveMeeting = () => {

        try {
            socket.emit('leave-meeting', {
                meetingId,
                streamId: myStream.id,
                username: loginUser.username,
            });

            handleMediaDevicesOff();

            if (peerService.peer) {
                peerService.peer.getSenders().forEach(sender => {
                    peerService.peer.removeTrack(sender);
                });
                peerService.peer.close();
                peerService.peer = null;
            }

            navigate('/');

        } catch (error) {
            handleSnackbar(true, error.message || 'Error leaving the meeting, please try again.')
        }
    }

    const handleButtonState = (btn) => {

        if (btn === 'isVideoOn') {
            if (buttonState.isVideoOn) {
                handleMediaDevicesOff();
            } else {
                handleMediaDevicesOn();
            }
        }
        setButtonState((prev) => ({ ...prev, [btn]: !prev[btn] }));
    }

    const handleIsJoinMeeting = () => {
        sendStreams();
        setIsJoinMeeting(true);
    }

    const handleCommentSubmit = (e) => {
        e.preventDefault();

        socket.emit('meeting-chat-message', {
            username: loginUser?.username,
            meetingId,
            message: meetingMessage,
        });
    }

    if (localMeeting) {
        const diff = (new Date() - new Date(localMeeting.createdAt)) / (1000 * 60); // in minute
        if (diff > localMeeting.duration * 60) {

            return (
                <div className='h-screen flex flex-col py-14 items-center text-white space-y-2 w-full bg-gray-800'>
                    <h1 className='text-2xl text-red-500 font-bold'>Meeting has expired.</h1>
                    <p>Duration: {localMeeting?.duration * 60} minutes</p>
                    <p>Date: {localMeeting?.createdAt?.substring(0, 10)} / {localMeeting?.createdAt?.substring(11, 19)}</p>
                    <DisplayTime />
                </div>
            )
        }
    }

    if (!localMeeting || !loginUser || isLoading) {
        return (
            <div className='h-screen flex flex-col py-14 items-center text-white space-y-2 w-full bg-gray-800'>
                <p>Meeting Title <span>{title}</span></p>
                <p>Meeting ID <span>{meetingId}</span></p>

                {
                    isLoading
                        ? <p>Loading</p>
                        : <p className='text-gray-500'>Current Live Meeting Not Found, Please Try Again.</p>
                }
            </div>
        )
    }

    return (
        <>

            {
                !loginUser && <div className='absolute flex flex-col justify-center items-center h-screen w-full z-10 bg-gray-700 opacity-50'>
                    <CircularProgress size="3rem" />
                </div>
            }

            {
                (remoteStream.length > 0 && !isJoinMeeting) && <div className='bg-[#ffffff26] z-10 flex items-center h-full w-full absolute'>
                    <button onClick={handleIsJoinMeeting} className='border mx-auto text-orange-300 border-gray-500 px-10 py-2 rounded-full bg-gray-500 hover:bg-gray-800 hover:text-orange-500'>Join</button>
                </div>
            }

            <div className='h-screen bg-gray-800 flex flex-col'>

                <div className='flex align-items-center justify-end p-4'>
                    <button
                        onClick={handleLeaveMeeting}
                        className='border-2 border-red-500 hover:bg-red-500 hover:text-white font-semibold text-red-500 px-3 py-1 rounded-full'
                    >
                        Leave Meeting
                    </button>
                </div>

                <div className='flex-1 flex flex-wrap md:flex-nowrap overflow-hidden px-4 text-white'>

                    <div className='flex flex-wrap w-full'>
                        <div className="meeting-videos grid grid-cols-2 md:h-full overflow-y-auto md:w-3/5 lg:w-3/4 gap-5" >

                            <ReactPlayer
                                playing={buttonState.isVideoOn}
                                muted={!buttonState.isMuteOn}
                                width="100%"
                                height={350}
                                url={myStream}
                            />

                            {remoteStream.map((url, idx) => (
                                <ReactPlayer
                                    key={idx}
                                    playing
                                    muted
                                    width="100%"
                                    height={350}
                                    url={url}
                                />
                            ))}

                        </div>

                        {/* user message */}
                        <div className='md:w-2/5 lg:w-1/4 md:ps-2 h-full hidden md:block'>
                            <div className='flex flex-col border border-gray-600 rounded-xl p-2 h-full relative '>
                                <ul className='flex-1 overflow-auto'>
                                    {
                                        localMeeting.message.map((message, idx) => (
                                            <li key={idx} className='bg-gray-700 py-1 px-2 rounded mb-2' >
                                                <h1 className='text-lg font-semibold'>{message.user}</h1>
                                                <p className='text-gray-300'>{message.message}</p>
                                            </li>
                                        ))
                                    }
                                </ul>

                                <form onSubmit={handleCommentSubmit} className="mt-2 p-1 border border-gray-500 bg-gray-800 rounded-lg flex items-center sticky left-0 bottom-0">
                                    <input
                                        type="text"
                                        className="bg-transparent flex-grow placeholder-gray-500 outline-0 min-w-14 border-e border-gray-500"
                                        placeholder="Enter message..."
                                        value={meetingMessage}
                                        onChange={(e) => setMeetingMessage(e.target.value)}
                                    />
                                    <button type={`${meetingMessage?.length > 0 ? 'submit' : 'button'}`} className={`p-1 text-sm me-1 ${meetingMessage?.length > 0 ? ' text-white' : 'text-gray-500'} `} >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='w-full flex justify-center p-4'>
                    <MeetingButtons buttonState={buttonState} handleButtonState={handleButtonState} handleLeaveMeeting={handleLeaveMeeting} />
                </div>

            </div>

        </>
    );
}


