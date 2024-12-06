import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../assets/UserContext';

const CreateRoom = () => {
  const { user } = useUser(); // Destructure setUser from useUser
  const [creator, setCreator] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [name, setName] = useState('');
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
  const navigate = useNavigate();

  const createRoom = async () => {
    setCreator(user.username);
    try {
        if (!creator)
          return;
        if (min < 0 || max < 0) {
          alert("Cannot put negative numbers");
          return;
        }
        if (min > max) {
          alert("Min cannot be greater than max");
          return;
        }

        const response = await axios.post(`${API_URL}/create-room`, { creator, name, min, max });
        const data = response.data;

        if (data.success) {
          // Store the room key and participant name in localStorage
          localStorage.setItem("roomKey", data.roomKey);
          navigate(`/${data.roomKey}`);
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
            placeholder="Your Room's Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full pl-4 pr-10 py-2 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700
              placeholder-gray-400 transition duration-200'
        />
        <div>
          <input required
              type="number"
              placeholder="Min members"
              min="0"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className='w-full pl-4 pr-10 py-2 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700
                placeholder-gray-400 transition duration-200'
          />
          <input required
              type="number"
              placeholder="Max members"
              min="0"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className='w-full pl-4 pr-10 py-2 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700
                placeholder-gray-400 transition duration-200'
          />
        </div>
        <button onClick={() => createRoom()} className='text-md mt-8 p-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg
            hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:ring-offset-gray-900
            transition duration-200'
        >
            Create Room
        </button>
    </div>
  );
};

export default CreateRoom;
