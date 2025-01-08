import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export default function RoomHistory({ loginUser }) {

    const [selectedSection, setSelectedSection] = useState("created-meeting");

    const handleSelectedComponent = (e) => {
        const { id } = e.target;
        document.getElementById(selectedSection).classList.remove("text-orange-500");
        document.getElementById(id).classList.add("text-orange-500");
        setSelectedSection(id);
    }

    const [selectedMeeting, setSelectedMeeting] = useState(null);

    return (
        <div className='flex-1 p-4 md:px-10' >
            <ul className='flex justify-evenly md:justify-start space-x-10 text-gray-500 mb-4'>
                <li><button onClick={handleSelectedComponent} id='created-meeting' className='text-orange-500'>Created Meeting</button></li>
                <li><button onClick={handleSelectedComponent} id='attended-meeting'>Attended Meeting</button></li>
            </ul>

            <div className='flex flex-wrap space-x-5' >
                {
                    selectedSection === "created-meeting"
                        ? <div className='lg:w-1/3 w-full mb-5'>
                            <TableContainer className='border' >
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow className='bg-gray-200'>
                                            <TableCell>Title</TableCell>
                                            <TableCell align="right">Join User</TableCell>
                                            <TableCell align="right">Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            loginUser?.meetingHistory?.created?.map((hstr) => (
                                                <TableRow
                                                    key={hstr?.meetingId?.createdAt}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    onClick={() => setSelectedMeeting(hstr?.meetingId)}
                                                    className='hover:bg-gray-100'
                                                >
                                                    <TableCell className='truncate whitespace-normal' component="th" scope="row">{hstr?.meetingId?.title}</TableCell>
                                                    <TableCell align="right" >{hstr?.meetingId?.joinUsers?.length}</TableCell>
                                                    <TableCell align="right" >{hstr?.meetingId?.createdAt?.substring(0, 10)}</TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                        : <div className='lg:w-2/5 w-full mb-5'>
                            <TableContainer className='border' >
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow className='bg-gray-200'>
                                            <TableCell>User</TableCell>
                                            <TableCell align="right">Title</TableCell>
                                            <TableCell align="right">Users</TableCell>
                                            <TableCell align="right">Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loginUser?.meetingHistory?.attended?.map((hstr) => (
                                            <TableRow
                                                key={hstr?.meetingId?.createdAt}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                onClick={() => setSelectedMeeting(hstr?.meetingId)}
                                                className='hover:bg-gray-100'
                                            >
                                                <TableCell className='truncate whitespace-normal' component="th" scope="row">{hstr?.meetingId?.user}</TableCell>
                                                <TableCell align="right" >{hstr?.meetingId?.title}</TableCell>
                                                <TableCell align="right" >{hstr?.meetingId?.joinUsers?.length}</TableCell>
                                                <TableCell align="right" >{hstr?.meetingId?.createdAt?.substring(0, 10)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                }
    
                {
                    selectedMeeting && <div className='flex-1 w-full lg:ps-5' style={{ margin: 0 }} >
                        <h1 className='text-2xl text-gray-500'><span className='text-gray-700'>Title:</span> {selectedMeeting?.title}</h1>

                        <div className='flex'>
                            <div className='w-full'>
                                <h1 className='text-blue-800 text-xl mb-2'>Join Users <span className='text-gray-500 font-semibold'>{selectedMeeting?.joinUsers?.length}</span></h1>
                                <div className='flex flex-wrap'>
                                    {
                                        selectedMeeting?.joinUsers?.map((user, idx) => (<div key={idx} className='border px-3 py-1 rounded-full bg-gray-100 h-fit mb-2 mx-1' >{user.username}</div>))
                                    }
                                </div>

                                <div className='border my-3'></div>
                                <h1 className='text-blue-800 text-xl pb-2'>Comments <span className='text-gray-500 font-semibold'>{selectedMeeting?.message?.length}</span></h1>
                                <div className='bg-gray-200 rounded'>
                                    {
                                        selectedMeeting?.message?.map((msg, idx) => <div key={idx} className='px-3 py-2' >
                                            <h1 className='text-blue-900 font-semibold'>{msg?.user}</h1>
                                            <p className='text-gray-500 bg-gray-100 rounded px-2 py-1'>{msg?.message}</p>
                                        </div>)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}