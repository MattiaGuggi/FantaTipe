/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../assets/UserContext';

const CreateRoom = () => {
  const { user } = useUser(); // Destructure setUser from useUser
  const [creator, setCreator] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [name, setName] = useState('');
  const [game, setGame] = useState('');
  const [games, setGames] = useState([]);
  const navigate = useNavigate();
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

  const inputControls = () => {
    if (!name) {
      alert('Room name is required');
      return true;
    }
    if (min < 0 || max < 0) {
      alert("Cannot put negative numbers");
      return true;
    }
    if (min > max) {
      alert("Min cannot be greater than max");
      return true;
    }
    if (!min) {
      alert('Min is required');
      return true;
    }
    if (!max) {
      alert('Max is required');
      return true;
    }
    if (!game) {
      alert('Choose a game');
      return true;
    }
    return false;
  };

  const createRoom = async () => {
    setCreator(user.username);
    try {
        if (inputControls()) return;

        const response = await axios.post(`${API_URL}/create-room`, { creator, name, min, max, game });
        const data = response.data;

        if (data.success) {
          // Store the room key and participant name in localStorage
          localStorage.setItem("roomKey", data.roomKey);
          localStorage.setItem("participant", creator);
          navigate(`/${data.roomKey}`);
        }
        else {
            console.error('Error creating room:', data.message);
        }
    } catch (err) {
        console.error('Error creating room:', err);
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(`${API_URL}/games`);
        const data = response.data;

        if (data.success)
            setGames(data.games);
        else
            console.error('Error getting games: ', data.message);
      } catch (err) {
        console.error('Error fetching the games', err);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className='flex flex-col justify-center items-center'>
        <h2 className='text-white font-bold text-2xl mb-12'>Create a Private Room</h2>
        <div className='w-1/2'>
          <input required
              type="text"
              placeholder="Your Room's Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full pl-4 pr-10 py-3 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700
                placeholder-gray-400 transition duration-200'
          />
          <input required
              type="number"
              placeholder="Min members"
              min="0"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              style={{ appearance: 'none' }}
              className='w-full pl-4 pr-10 py-3 mt-4 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700
                placeholder-gray-400 transition duration-200'
          />
          <input required
              type="number"
              placeholder="Max members"
              min="0"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              style={{ appearance: 'none' }}
              className='w-full pl-4 pr-10 py-3 mt-4 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700
                placeholder-gray-400 transition duration-200'
          />
        </div>
        <h2 className='text-white text-2xl font-bold m-4'>Choose a game:</h2>
        <div className="flex flex-wrap justify-center">
            {games.length > 0 ? (
                games.map((game, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-center cursor-pointer py-5 px-10 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white m-4
                    font-bold rounded-2xl shadow-lg hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2
                    focus:ring-offset-gray-900 transition-all duration-200 hover:scale-110'
                    onClick={() => setGame(game)}
                  >
                      {game}
                  </div>
                ))
            ) : (
                <div className="text-red-600 font-bold">No games found</div>
            )}
        </div>
        <div className='flex justify-center items-center w-full'>
          <div className='w-1/3 flex items-center justify-center py-3 px-10 text-white text-lg font-bold'
          >
            Game selected: {game}
          </div>
        </div>
        <button onClick={() => createRoom()} className='text-md mt-4 p-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg
            hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:ring-offset-gray-900
            transition-all duration-200 hover:scale-110'
        >
            Create Room
        </button>
    </div>
  );
};

export default CreateRoom;