import React from 'react';
import MicIcon from '@mui/icons-material/Mic';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import PresentToAllOutlinedIcon from '@mui/icons-material/PresentToAllOutlined';
import CallEndOutlinedIcon from '@mui/icons-material/CallEndOutlined';
import Tooltip from '@mui/material/Tooltip';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import CancelPresentationOutlinedIcon from '@mui/icons-material/CancelPresentationOutlined';

export default function MeetingButtons() {
    return (
        <ul className='flex space-x-5'>
            <li>
                <button className='bg-gray-700 text-white w-10 h-10 rounded-full'>
                    {true
                        ? <Tooltip title="Mute"><MicIcon className="text-green-400" /></Tooltip>
                        : <Tooltip title="Unmute"><MicOffIcon /></Tooltip>
                    }
                </button>
            </li>
            <li>
                <button className='bg-gray-700 text-white w-10 h-10 rounded-full'>
                    {true
                        ? <Tooltip title="Turn Off Video"><VideocamOutlinedIcon className="text-green-400" /></Tooltip>
                        : <Tooltip title="Turn On Video"><VideocamOffOutlinedIcon /></Tooltip>
                    }
                </button>
            </li>
            <li>
                <button className='bg-gray-700 text-white w-10 h-10 rounded-full'>
                    {true
                        ? <Tooltip title="Stop Sharing"><PresentToAllOutlinedIcon className="text-green-400" /></Tooltip>
                        : <Tooltip title="Share Screen"><CancelPresentationOutlinedIcon /></Tooltip>
                    }
                </button>
            </li>
            <li>
                <Tooltip title="Leave Meeting">
                    <button
                        className='bg-red-500 text-white border-2 border-red-600 w-14 h-10 rounded-3xl hover:bg-transparent hover:text-red-500'
                    >
                        <CallEndOutlinedIcon />
                    </button>
                </Tooltip>
            </li>
        </ul>
    )
}