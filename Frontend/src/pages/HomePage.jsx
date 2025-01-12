import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApplicationData } from '../services/roomService';

export default function HomePage() {

    const [appData, setAppData] = useState({ totalUsers: 0, totalMeetings: 0 });

    useEffect(() => {
        const handleAppData = async() => {
            const response = await getApplicationData();

            if(response.status === 200) {
                const { totalUser, totalMeeting } = response.data;
                setAppData({ totalUsers: totalUser, totalMeetings: totalMeeting });
            }
        }
        handleAppData();
    }, []);

    return (

        <div className='flex-1 p-4 md:p-10'>
            <div className='md:flex justify-evenly bg-gradient-to-r from-gray-200 to-white md:px-10 md:py-14 rounded-2xl'>
                <div className='p-4 py-7 lg:pe-10'>
                    <h1 className="pb-10 text-3xl lg:text-5xl md:leading-snug font-bold text-gray-400" style={{ lineHeight: "1.7" }} >
                        Catch up with <span className="text-orange-500">Friends</span>, <br /> hold <span className="text-orange-500">meetings</span>, <br /> and share <span className="text-orange-500">moments</span>
                    </h1>

                    <Link to={"/join-meeting"} className='bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-2 rounded text-white font-semibold'>Click To Join Meeting</Link>

                </div>
                <div className='md:w-1/3 p-8 md:p-0'>
                    <img src="/assets/video-call-image.png" alt='' className='w-full' />
                </div>
            </div>

            <div className='flex flex-col text-center pt-14 pb-10 md:pb-14 lg:w-4/5 lg:mx-auto'>
                <h1 className='text-6xl lg:text-7xl font-bold text-blue-800 md:tracking-widest py-2 px-4'>Live Meeting</h1>
                <div className='flex flex-wrap md:flex-nowrap justify-evenly py-7 font-bold'>
                    <div className='w-full md:p-0 pb-6'>
                        <h1 className='text-5xl lg:text-6xl text-gray-400'>Live Users</h1>
                        <p className='text-4xl py-3 text-orange-700'>{appData.totalUsers || 0}</p>
                    </div>
                    <div className='w-full md:p-0 pb-10'>
                        <h1 className='text-5xl lg:text-6xl text-gray-400'>Total Meetings</h1>
                        <p className='text-4xl py-3 text-orange-700'>{appData.totalMeetings || 0}</p>
                    </div>
                </div>
            </div>

            <div className='md:flex justify-evenly bg-gradient-to-r from-white to-gray-200 md:px-10 md:py-14 rounded-2xl mb-5'>
                <div className='p-4 py-7 lg:pe-10 md:w-1/2'>
                    <h1 className="pb-10 text-xl md:text-2xl lg:text-4xl md:leading-snug font-bold text-gray-400" style={{ lineHeight: "1.7" }} >
                        <span className='text-gray-300'>Empower Collaboration:</span> Every call, every meeting, every connection brings us closer to ideas, friendships, and growth.
                    </h1>

                    <Link to={"schedule-meeting"} className='bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-2 rounded text-white font-semibold'>Schedule New Meeting</Link>
                </div>
                <div className='md:w-1/3 p-8 md:p-0'>
                    <img src="/assets/schedulemeeting.png" alt='' className='w-full' />
                </div>
            </div>
        </div>

    )
}