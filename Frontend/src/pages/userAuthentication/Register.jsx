import React, { useState } from 'react';
import { TextField, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { register } from '../../services/authService';
import CircularProgress from '@mui/material/CircularProgress';

export default function Register({ handleSnackbar }) {

    const navigate = useNavigate();

    const [inputValue, setInputValue] = useState({
        username: "",
        name: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputValue = (e) => {
        const { name, value } = e.target;
        setInputValue((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const { name, username, password } = inputValue;
        const result = await register(name, username, password);

        if (result?.status === 200) {
            handleSnackbar(true, "User Registered Successfully");
            navigate('/login');
        } else {
            handleSnackbar(true, result?.error || "Error in signup");
        }
        setIsLoading(false);
    };


    return (
        <div className="min-h-screen overflow-auto flex justify-center bg-gray-100 px-4 py-10">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm mt-10 h-fit">
                <h2 className="text-4xl text-gray-500 font-semibold text-center mb-6 pb-5">Sign Up</h2>

                <form onSubmit={handleFormSubmit}>

                    <div className="mb-4">
                        <TextField
                            label="Name"
                            variant="outlined"
                            fullWidth
                            type="text"
                            value={inputValue.name}
                            name="name"
                            onChange={handleInputValue}
                            size="small"
                        />
                    </div>

                    <div className="mb-4">
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            value={inputValue.username}
                            name="username"
                            onChange={handleInputValue}
                            size="small"
                        />
                    </div>
                    <div className="mb-4">
                        <TextField
                            label="Password"
                            variant="outlined"
                            type="password"
                            fullWidth
                            value={inputValue.password}
                            name="password"
                            onChange={handleInputValue}
                            size="small"
                        />
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        className="mb-4 p-1"
                        type="submit"
                        disabled={isLoading}
                    >
                        {
                            isLoading ? <CircularProgress style={{color: "white"}} size="25px" /> : "Sign Up"
                        }
                    </Button>
                    <div className="text-center text-gray-500 pt-10">
                        <p>
                            Already have an account?{" "}
                            <Link to="/login" className="text-blue-700">
                                Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}