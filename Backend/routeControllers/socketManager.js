import { Server } from "socket.io";

const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });

    io.on("connection", (socket) => {
        console.log("a user connected to socket");

        socket.on("user-message", (data) => {
            console.log(data);
        });

        socket.on("disconnect", () => {
            console.log("user disconnected.");
        });
    });
}



export { connectToSocket };