import { useState } from 'react';
import axios from 'axios';

const CreateRoom = () => {
  const [creator, setCreator] = useState('');
  const [name, setName] = useState('');
  const [roomKey, setRoomKey] = useState(null);
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

  const createRoom = async () => {
    try {
        if (!creator)
          return;

        const response = await axios.post(`${API_URL}/create-room`, { creator, name });
        const data = response.data;

        if (data.success) {
            setRoomKey(data.roomKey);
        }
        else {
            console.error('Error creating room:', data.message);
        }
    } catch (err) {
        console.error('Error creating room:', err);
    }
  };

  return (
    <div>
        <h2 className='text-white font-bold text-2xl mb-12'>Create a Private Room</h2>
        <input required
            type="text"
            placeholder="Your Name"
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            className='w-full pl-4 pr-10 py-2 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700
              placeholder-gray-400 transition duration-200'
        />
        <input required
            type="text"
            placeholder="Your Room's Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full pl-4 pr-10 py-2 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700
              placeholder-gray-400 transition duration-200'
        />
        <button onClick={() => createRoom()} className='text-md mt-8 p-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg
            hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:ring-offset-gray-900
            transition duration-200'
        >
            Create Room
        </button>
        {roomKey && <p className='text-white mt-4'>Room Key: {roomKey} (Share this with others)</p>}
    </div>
  );
};

export default CreateRoom;
