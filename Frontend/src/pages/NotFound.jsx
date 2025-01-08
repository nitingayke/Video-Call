import React from "react";
import { Link } from "react-router-dom"; 

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-5">
            <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
            <p className="text-xl mb-4 text-gray-500">Oops! Page Not Found.</p>
            <p className="mb-4 text-gray-500">
                We couldn't find the page you were looking for. Please check the URL or use the link below to return to the homepage.
            </p>
            <Link
                to="/"
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
            >
                Go Back to Homepage
            </Link>

        </div>
    );
};

export default NotFound;
