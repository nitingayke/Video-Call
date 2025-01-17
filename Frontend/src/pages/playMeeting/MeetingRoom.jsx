import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMeetingData } from '../../services/roomService';

import CircularProgress from '@mui/material/CircularProgress';
import MeetingButtons from './MeetingButtons';
import ReactPlayer from 'react-player'
import DisplayTime from '../../components/DisplayTime';


const currMeeting = true


export default function MeetingRoom({ loginUser, handleSnackbar }) {

    const navigate = useNavigate();
    const { meetingId, title } = useParams();

    const [localMeeting, setLocalMeeting] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [myStream, setMyStream] = useState(null);



    const handleMediaDevices = async () => {

        try {
            setIsLoading(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });

            setMyStream(stream);
        } catch (error) {
            if (error.name === "NotFoundError") {
                handleSnackbar(true, "No camera or microphone found.");
            }
        } finally {
            setIsLoading(false);
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
        handleMediaDevices();

    }, [loginUser]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();

    }

    if (localMeeting) {
        const diff = (new Date() - new Date(localMeeting.createdAt)) / (1000 * 60); // in minute
        if (diff > localMeeting.duration * 60) {

            return (
                <div className='h-screen flex flex-col py-14 items-center text-white space-y-2 w-full bg-gray-800'>
                    <h1 className='text-2xl text-red-500 font-bold'>Meeting has expired.</h1>
                    <p>Duration: {localMeeting?.duration * 60} minutes</p>
                    <p>Date: {localMeeting?.createdAt?.substring(0, 10)}</p>
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

            <div className='h-screen bg-gray-800 flex flex-col'>

                <div className='flex align-items-center justify-end p-4'>
                    <button className="px-3 py-1 text-white">Total Users <span className="ps-1">{10}</span></button>
                    <button
                        className='border-2 border-red-500 hover:bg-red-500 hover:text-white font-semibold text-red-500 px-3 py-1 rounded-full'
                    >
                        Leave Meeting
                    </button>
                </div>

                <div className='flex-1 flex flex-wrap md:flex-nowrap overflow-hidden px-4 text-white'>

                    <div className='flex flex-wrap w-full'>
                        <div className="grid grid-cols-2 lg:grid-cols-3 md:h-full overflow-auto md:w-3/5 lg:w-3/4" >
                            <div className="bg-black border border-black rounded-xl overflow-hidden h-fit">
                                <ReactPlayer
                                    playing
                                    muted
                                    width="100%"
                                    height={250}
                                    url={myStream}
                                />
                            </div>

                        </div>

                        {/* user message */}
                        <div className='md:w-2/5 lg:w-1/4 md:ps-2 h-full hidden md:block'>
                            <div className='flex flex-col border border-gray-600 rounded-xl p-2 h-full relative '>
                                <ul className='flex-1 overflow-auto'>
                                    {
                                        [].map((message, idx) => (
                                            <li key={idx} className='bg-gray-700 py-1 px-2 rounded mb-2' >
                                                <h1 className='text-lg font-semibold'>{message.user}</h1>
                                                <p className='text-gray-300'>{message.message}</p>
                                            </li>
                                        ))
                                    }
                                </ul>

                                <form onSubmit={handleCommentSubmit} className="mt-2 border border-gray-500 bg-gray-800 rounded-lg flex items-center sticky left-0 bottom-0">
                                    <input
                                        type="text"
                                        className="bg-transparent p-1 flex-grow placeholder-gray-500 outline-0 min-w-14"
                                        placeholder="Enter message..."
                                    />
                                    <button className={`p-1 text-sm me-1 text-white`} type="submit">
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='w-full flex justify-center p-4'>
                    <MeetingButtons />
                </div>

            </div>

        </>
    );
}
