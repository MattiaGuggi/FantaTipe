/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from 'axios';
import { useParams } from "react-router-dom";

const Room = () => {
    const { key } = useParams();
    const [roomDetails, setRoomDetails] = useState({ participants: [] });
    const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

    const getRoomName = async () => {
        try {
            if (!key) return;
            const response = await axios.post(`${API_URL}/${key}`);
            const data = response.data;

            if (data.success) {
                setRoomDetails(data.room);
            } else {
                console.error('Error getting room name: ', data.error);
            }
        } catch (err) {
            console.error('Error fetching room details:', err);
        }
    };

    useEffect(() => {
        getRoomName();
    }, [key]);

    return (
        <>
            {roomDetails ? (
                <>
                    <h1 className='text-white font-bold text-3xl mb-12'>
                        Joined Room: {roomDetails.name || 'Loading...'}
                    </h1>
                    <h3 className='text-white text-2xl mb-3'>Participants:</h3>
                    {roomDetails.participants.length > 0 ? (
                        roomDetails.participants.map((participant, index) => (
                            <div key={index} className="text-white text-xl flex">{participant}</div>
                        ))
                    ) : (
                        <div className="text-white text-xl">No participants left</div>
                    )}
                </>
            ) : (
                <div className="text-white text-xl">Loading room details...</div>
            )}
        </>
    );
};

export default Room;
