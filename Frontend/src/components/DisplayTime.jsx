import React, { useEffect } from 'react';

export default function DisplayTime() {

    useEffect(() => {
        const timer = setInterval(() => {
            document.querySelector('.current-time').innerHTML = new Date();
        }, 1000);

        return () => clearInterval(timer);
    }, []);
    return (
        <p className='current-time'></p>
    )
}