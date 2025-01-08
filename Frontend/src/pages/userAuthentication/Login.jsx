import React, { useState } from 'react';
import { TextField, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from '../../services/authService';
import CircularProgress from '@mui/material/CircularProgress';

export default function Login({ handleLoginUser, handleSnackbar }) {

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const [inputValue, setInputValue] = useState({
        username: "",
        password: ""
    });

    const handleInputValue = (e) => {
        const { name, value } = e.target;
        setInputValue((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleFormSubmit = async (e) => {

        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await loginUser(inputValue.username, inputValue.password);
            
            if (result?.status === 200) {

                const { user, token } = result.data;

                handleLoginUser(user);

                handleSnackbar(true, "User Login Successfully");

                localStorage.setItem("authToken", token);

                navigate("/");

            } else {
                handleSnackbar(true, result?.error || "Error in login");
            }
        } catch (error) {
            handleSnackbar(true, error?.message || "Error in login");
        } finally {
            setIsLoading(false);
            setInputValue({ username: "", password: "" });
        }
    }

    return (
        <div className="min-h-screen overflow-auto flex justify-center bg-gray-100 px-4 py-10">
            <div className="bg-white p-8 rounded-lg shadow-md h-fit w-full max-w-sm my-10">
                <h2 className="text-4xl font-semibold text-center text-gray-500 mb-6 pb-5">Login</h2>

                <form onSubmit={handleFormSubmit} >
                    <div className="mb-4">
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            value={inputValue.username}
                            name="username"
                            onChange={handleInputValue}
                            size='small'
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
                            size='small'
                        />
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        className="mb-4"
                        type="submit"
                        disabled={isLoading}
                    >
                        {
                            isLoading ? <CircularProgress size="25px" /> : "Login"
                        }
                    </Button>
                    <div className="text-center pt-10">
                        <p className='text-gray-500'>
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-blue-700">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}