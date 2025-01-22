import { io } from 'socket.io-client';
const socket = io(`https://video-call-server-hxw6.onrender.com`);

export { socket };