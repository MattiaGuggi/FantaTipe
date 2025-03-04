/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../assets/UserContext";
import { io } from "socket.io-client";

const Room = ({ setIsGameStarted }) => {
    const { user } = useUser();
    const { key } = useParams();
    const [roomDetails, setRoomDetails] = useState({ participants: [] });
    const [participantPfps, setParticipantPfps] = useState({});
    const navigate = useNavigate();
    const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
    const socket = io(API_URL);

    const getRoomDetails = async () => {
        try {
            if (!key) return;
            const response = await axios.post(`${API_URL}/${key}`);
            const data = response.data;

            if (data.success) {
                setRoomDetails(data.room);
                fetchAllPfps(data.room.participants);
            }
            else {
                console.error('Error getting room name: ', data.error);
            }
        } catch (err) {
            console.error('Error fetching room details:', err);
        }
    };

    const getUserPfp = async (username) => {
        try {
            const response = await fetch(`${API_URL}/get-users`);
            const data = await response.json();
    
            if (response.ok) {
                const foundUser = data.users.find((usr) => usr.username === username);
                return foundUser ? foundUser.pfp : '';
            }
        } catch (err) {
            console.error('Error fetching user pfp: ', err);
        }
    };

    const fetchAllPfps = async (participants) => {
        const pfps = {};

        for (const participant of participants) {
            const pfp = await getUserPfp(participant);
            pfps[participant] = pfp;
        }
        
        setParticipantPfps(pfps);
    };

    const deleteRoom = async () => {
        try {
            if (!key) return;
            
            socket.emit('deleteRoom', { key: key, name: roomDetails.name });
        } catch (err) {
            console.error('Error deleting room:', err);
        }
    };

    const logOut = () => {
        console.log("Logging out...");
        localStorage.removeItem("roomKey");
        localStorage.removeItem("participant");
        socket.emit('userLoggedOut', { key: key, user: user.username });
        navigate('/join-room');
    };

    // Check the min number of participants
    const startGame = async () => {
        if (roomDetails.participants > roomDetails.max || roomDetails.participants < roomDetails.min) {
            alert(`A minimum of ${roomDetails.min} and a maximum of ${roomDetails.max} participants are required.`);
        }
        else {
            console.log('Starting game...');
            socket.emit('startGame', { key: key });
        }
    };
    
    const clearLocalStorage = () => {
        localStorage.removeItem("roomKey");
        localStorage.removeItem("participant");

        // Deletes room if he was the creator
        if (user.username === roomDetails.creator) {
            socket.emit('deleteRoom', { key: key, name: roomDetails.name });
        }
    };

    useEffect(() => {
        getRoomDetails();
    }, [key]);

    useEffect(() => {
        socket.on('refreshRoom', (data) => {
            if (data.key === key) {
                alert(`Room '${data.name}' has been deleted by the creator.`);
                localStorage.removeItem("roomKey");
                localStorage.removeItem("participant");
                navigate('/join-room');
            }
        });

        socket.on('startGame', () => {
            alert('Game started');
            setIsGameStarted(true);
            navigate(`/${roomDetails.game.toLowerCase().replace(' ', '-')}/${key}`);
        });

        socket.on('userJoined', (data) => {
            console.log(`${data.participant} joined the room!`);
            getRoomDetails();
        });

        socket.on('userLoggedOut', (data) => {
            console.log(`${data.participant} logged out of the room!`);
            getRoomDetails();
        });

        // Cleanup localStorage when the user disconnects
        window.addEventListener("beforeunload", clearLocalStorage);
    
        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener("beforeunload", clearLocalStorage);
            socket.off('refreshRoom');
            socket.disconnect();
        };
    }, [socket]);

    return (
        <>
            <h1 className='text-white font-bold text-3xl mb-2'>
                Joined Room: {roomDetails.name || 'Loading...'}
            </h1>
            <h3 className='text-white'>Key: {key}</h3>
            {user.username == roomDetails.creator ? (
                <div className='flex m-16 gap-20'>
                    <button className='text-md mt-8 px-8 py-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg
                            hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:ring-offset-gray-900
                            transition-all duration-200 hover:scale-110'
                            onClick={() => startGame()}
                    >
                        Start Game
                    </button>
                    <button className='text-md mt-8 px-8 py-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg
                        hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:ring-offset-gray-900
                        transition-all duration-200 hover:scale-110'
                        onClick={() => deleteRoom()}
                    >
                        Delete Room
                    </button>
                </div>
            ) : (
                <>
                    <h2 className='text-white text-xl'>Waiting for the host to start the game...</h2>
                </>
            )}
            <h3 className='text-white text-2xl mb-3'>Participants:</h3>
            {roomDetails.participants.length > 0 ? (
                roomDetails.participants.map((participant) => (
                    <div key={participant} className="relative w-32 h-32 mb-4">
                        <img 
                            src={participantPfps[participant] || ''} 
                            alt={`${participant}'s avatar`} 
                            className='w-full h-full rounded-full object-cover'
                        />
                        <div className='absolute text-white flex justify-center items-center text-2xl inset-0 bg-black bg-opacity-50 rounded-full opacity-0 transition-opacity duration-300 hover:opacity-100 cursor-pointer'>
                            {participant}
                        </div>
                    </div>
                ))
            ) : (
                <div className='text-white text-xl'>No participants joined yet</div>
            )}
            <div className="relative inline-block mt-6">
                <button className="text-white py-3 px-6 border rounded-full shadow-custom hover:opacity-10 transition-all duration-200 hover:scale-110">
                    Log Out
                </button>
                <div className="absolute text-white flex justify-center items-center text-2xl inset-0 bg-black bg-opacity-60 rounded-full 
                    opacity-0 transition-all duration-300 hover:opacity-50 cursor-pointer" onClick={() => logOut()} />
            </div>
        </>
    );    
};

export default Room;