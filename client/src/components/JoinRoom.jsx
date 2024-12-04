import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JoinRoom = ({ setRoom }) => {
  const [key, setKey] = useState('');
  const [participant, setParticipant] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

  const joinRoom = async () => {
    try {
        if (!key || !participant) return;
        const response = await axios.post(`${API_URL}/join-room`, { key, participant });
        const data = response.data;

        if (data.success) {
            setRoom(data.room);
            navigate(`/${data.room.key}`);
        }
        else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Error joining room:', err);
    }
  };

  return (
    <div>
        <h2 className='text-white font-bold text-2xl mb-5'>Join a Private Room</h2>
        <input required
            type="text"
            placeholder="Room Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className='w-full pl-4 pr-10 py-2 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700
                placeholder-gray-400 transition duration-200'
        />
        <input
            type="text"
            placeholder="Your Name"
            value={participant}
            onChange={(e) => setParticipant(e.target.value)}
            className='w-full pl-4 pr-10 py-2 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700
                placeholder-gray-400 transition duration-200'
        />
        <button onClick={() => joinRoom()}
            className='text-md mt-8 px-8 py-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg
            hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:ring-offset-gray-900
            transition duration-200'
        >
            Join Room
        </button>
    </div>
  );
};

export default JoinRoom;
