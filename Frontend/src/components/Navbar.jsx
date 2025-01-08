import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    px: 2,
    py: 3,
};

export default function Navbar({ loginUser, handleLoginUser, handleSnackbar, isLoading }) {

    const [isOpenBox, setIsOpenBox] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const navigate = useNavigate();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        setIsOpenBox(false);
        localStorage.removeItem('authToken');
        handleLoginUser(null);
        handleSnackbar(true, "User logout successfully");
        navigate("/");
    }

    return (
        <>
            <nav className=' px-4 sticky top-0 left-0 w-full bg-gray-100 z-10'>
                <header className='py-3 flex justify-between items-center '>
                    <h1 className='font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent text-3xl'>
                        <Link to={"/"} >Live Meeting</Link>
                    </h1>
                    <div className='space-x-5 text-lg text-gray-400 hidden md:block' >
                        {
                            ["Join Meeting", "Schedule Meeting", "History"].map((section, idx) => (
                                <Link className='hover:text-[#030071]' key={idx} to={`${section.toLowerCase().split(" ").join("-")}`}>{section}</Link>
                            ))
                        }
                        {
                            (!loginUser)
                                ? <Link className='hover:text-[#030071]' to={`/login`}>Login</Link>
                                : <button onClick={() => setIsOpenBox(true)} >{(loginUser?.username).substring(0, 10)}</button>
                        }
                    </div>

                    <div className='md:hidden'>
                        <Button
                            id="basic-button"
                            aria-controls={open ? 'basic-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                        >
                            <MenuIcon className='text-gray-500' style={{ fontSize: "1.8rem" }} />
                        </Button>
                        <Menu
                            id="basic-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{
                                'aria-labelledby': 'basic-button',
                            }}
                        >
                            {
                                ["Join Meeting", "Schedule Meeting", "History"].map((section, idx) => (
                                    <Link className='hover:text-[#030071] text-gray-400' key={idx} to={`${section.toLowerCase().split(" ").join("-")}`}>
                                        <MenuItem onClick={handleClose} >
                                            {section}
                                        </MenuItem>
                                    </Link>
                                ))
                            }
                            {
                                (!loginUser)
                                    ? <Link className='hover:text-[#030071] text-gray-400' to={`/login`}>
                                        <MenuItem onClick={handleClose} >
                                            Login
                                        </MenuItem>
                                    </Link>
                                    : <MenuItem onClick={() => {
                                        handleClose();
                                        setIsOpenBox(true)
                                    }}
                                    >
                                        <button>
                                            {(loginUser?.username).substring(0, 10)}
                                        </button>
                                    </MenuItem>
                            }
                        </Menu>
                    </div>
                </header>

                { 
                    isLoading && <div>
                        <LinearProgress color="secondary" style={{ zIndex: 5000 }} className='' />
                    </div>
                }

            </nav>

            <Modal
                open={isOpenBox}
                onClose={() => setIsOpenBox(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className='rounded-lg' >
                    <h1 className='text-3xl font-bold text-gray-400'>Log Out</h1>

                    <div className='flex justify-end space-x-2 pt-5'>
                        <button onClick={() => setIsOpenBox(false)} className='rounded bg-gray-100 px-4 py-1 text-gray-800 hover:bg-gray-300 hover:text-gray-800 border'>Cancel</button>
                        <button onClick={handleLogout} className='rounded bg-gray-100 px-4 py-1 text-gray-800 hover:bg-gray-300 hover:text-gray-800 border'>Logout</button>
                    </div>
                </Box>
            </Modal>
        </>
    )
}