import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import JoinRoom from './pages/JoinRoom';
import Login from './pages/userAuthentication/Login.jsx';
import Register from './pages/userAuthentication/Register.jsx'
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import { fetchLoginUserProfile } from './services/authService.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import RoomHistory from './pages/RoomHistory.jsx';
import ScheduleRoom from './pages/ScheduleRoom.jsx';
import LinearProgress from '@mui/material/LinearProgress';
import MeetingRoom from './pages/MeetingRoom.jsx';
import { socket } from './services/socket.js';


function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}


function RouterComponent({ loginUser, handleLoginUser, handleSnackbar }) {

  const location = useLocation();
  const showComponent = ["/", "/join-meeting", "/schedule-meeting", "/history"].includes(location.pathname);
  const [isLoading, setIsLoading] = useState(false);

  const handleIsLoading = (status) => {
    setIsLoading(status);
  }

  useEffect(() => {

    const handleSocketError = ({ message }) => {
      handleSnackbar(true, message || "network error, please try again.")
    }

    socket.on('error', handleSocketError);

    return () => {
      socket.off('error', handleSocketError);
    }

  }, []);

  return (
    <>
      {showComponent && <Navbar loginUser={loginUser} handleLoginUser={handleLoginUser} handleSnackbar={handleSnackbar} isLoading={isLoading} />}

      <Routes>
        <Route path='/' element={<HomePage />} />

        <Route path='/login' element={<Login handleLoginUser={handleLoginUser} handleSnackbar={handleSnackbar} />} />
        <Route path='/signup' element={<Register handleSnackbar={handleSnackbar} />} />

        <Route path='/join-meeting' element={<JoinRoom loginUser={loginUser} handleSnackbar={handleSnackbar} />} />

        <Route path='/history' element={<RoomHistory loginUser={loginUser} />} />

        <Route path='/schedule-meeting' element={<ScheduleRoom loginUser={loginUser} handleSnackbar={handleSnackbar} handleIsLoading={handleIsLoading} />} />

        <Route path='/meeting-room/:meetingId/:title' element={<MeetingRoom loginUser={loginUser} handleSnackbar={handleSnackbar} />} />

        <Route path='*' element={<NotFound />} />
      </Routes>

      {showComponent && <Footer />}
    </>
  )
}


function App() {

  const [loginUser, setLoginUser] = useState(null);

  const handleLoginUser = (user) => {
    setLoginUser(user);
  }

  useEffect(() => {

    const handleFetchUserProfile = async () => {

      const result = await fetchLoginUserProfile();

      if (result?.status === 200) {
        setLoginUser(result?.data?.user);
      } else {
        setLoginUser(null);
        handleSnackbar(false, result?.error || "User not login");
      }
    }

    handleFetchUserProfile();
  }, []);

  const [state, setState] = useState({
    open: false,
    message: "",
  });

  const handleSnackbar = (status, msg) => {
    setState({ message: msg, open: status });
  }

  return (

    <BrowserRouter>

      <RouterComponent
        loginUser={loginUser}
        handleLoginUser={handleLoginUser}
        handleSnackbar={handleSnackbar}
      />

      <Snackbar
        open={state.open}
        onClose={() => handleSnackbar(false)}
        TransitionComponent={SlideTransition}
        message={state.message}
        key={SlideTransition.name}
        autoHideDuration={4800}
      />

    </BrowserRouter>

  )
}

export default App
