/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { useParams } from "react-router-dom";

const Room = () => {
    const { key } = useParams();
    const [roomDetails, setRoomDetails] = useState({ participants: [] });
    const [participantPfps, setParticipantPfps] = useState({});
    const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

    const getRoomName = async () => {
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

    // Opzioni per gestione stanza: max players, etc...
    // Tasto start game per il creator
    // Tasto delete room per il creator
    // Tasto exit room per chiunque
    // Creare una sessione per rimanere loggato nella JoinRoom

    useEffect(() => {
        getRoomName();
    }, [key]);

    return (
        <>
            <h1 className='text-white font-bold text-3xl mb-12'>
                Joined Room: {roomDetails.name || 'Loading...'}
            </h1>
            <h3 className='text-white text-2xl mb-3'>Participants:</h3>
            {roomDetails.participants.length > 0 ? (
                roomDetails.participants.map((participant) => (
                    <div key={participant} className="relative w-32 h-32 mb-4">
                        {/* Participant image */}
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
                <div className="text-white text-xl">No participants left</div>
            )}
        </>
    );    
};

export default Room;
