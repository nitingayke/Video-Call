# Video Call Application

This project is a **Video Call Application** implemented using **WebRTC**, allowing two users to communicate via video call and chat. The chat functionality is powered by **Socket.io** for real-time messaging.

## Project Setup Instructions

### Clone the Project

```bash
git clone https://github.com/nitingayke/Video-Call.git
```

Navigate to the project directory:
```bash
cd Video-Call
```

## Backend Setup
### Move to the backend directory:

```bash
cd Backend
```

Install the dependencies:
```bash
npm install
```
Start the backend server:

```
node index.js
```
or
```
nodemon index.js
```

## Note:
## You may encounter an error: MongoDB URL not found or Secret Key.

To fix this issue:

Create a .env file in the Backend directory.
MONGO_URL
JWT_SECRET

## Frontend Setup
Move to the frontend directory:

```
cd Frontend
```

## Install the dependencies:

```
npm install
```

Run the frontend server:
```
npm run dev
```


## Features
### Video call functionality using WebRTC.
### Real-time chat using Socket.io.
### Seamless communication between two users.
### Technologies Used
### WebRTC for video calling.
### Socket.io for real-time chat.
### Node.js and Express.js for backend.
### React.js for frontend.
### MongoDB for database storage.
