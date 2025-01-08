import axios from 'axios';

const loginUser = async (username, password) => {
    try {
        const response = await axios.post('http://localhost:8000/auth/login', {
            username,
            password
        });
        return response;
    } catch (error) {
        return { status: false, error: error?.response?.data?.message || "Login failed. Please try again." };
    }
}

const register = async (name, username, password) => {
    try {
        const response = await axios.post('http://localhost:8000/auth/register', {
            name,
            username,
            password
        });

        if (response.status === 200) {
            return response;
        } else {
            return null;
        }
    } catch (error) {
        return { status: false, error: error?.response?.data?.message || "Registration failed. Please try again." };
    }
}

const fetchLoginUserProfile = async () => {
    try {
        const response = await axios.post('http://localhost:8000/auth/user-profile', {
            token: localStorage.getItem("authToken"),
        });
        return response;
    } catch (error) {
        return { status: false, error: error?.response?.data?.message || "User not login." };
    }
}

export { loginUser, register, fetchLoginUserProfile };
