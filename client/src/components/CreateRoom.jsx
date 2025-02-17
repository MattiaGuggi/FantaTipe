/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../assets/UserContext';
import Input from '../assets/Input';
import { ArrowUpAZ, ArrowUp10 } from 'lucide-react';
import CustomButton from '../assets/CustomButton';

const CreateRoom = () => {
  const { user } = useUser(); // Destructure setUser from useUser
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
    try {
        if (inputControls()) return;

        const response = await axios.post(`${API_URL}/create-room`, { creator: user.username, name, min, max, game });
        const data = response.data;

        if (data.success) {
          // Store the room key and participant name in localStorage
          localStorage.setItem("roomKey", data.roomKey);
          localStorage.setItem("participant", user.username);
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
    <div className='flex flex-col justify-center items-center mb-20'>
        <h2 className='text-white font-bold text-2xl mb-4 mt-4'>Create a Private Room</h2>
        <div className='w-1/2'>
          <Input
              icon={ArrowUpAZ}
              type="text"
              placeholder="Your Room's Name"
              value={name}
              margin={'mb-6'}
              onChange={(e) => setName(e.target.value)}
          />
          <Input
              icon={ArrowUp10}
              type="number"
              placeholder="Min members"
              min="0"
              value={min}
              margin={'mb-6'}
              onChange={(e) => setMin(e.target.value)}
              style={{ appearance: 'none' }}
          />
          <Input
              icon={ArrowUp10}
              type="number"
              placeholder="Max members"
              min="0"
              value={max}
              margin={'mb-6'}
              onChange={(e) => setMax(e.target.value)}
              style={{ appearance: 'none' }}
          />
        </div>
        <h2 className='text-white text-2xl font-bold m-4'>Choose a game:</h2>
        <div className="flex flex-wrap justify-center">
            {games.length > 0 ? (
                games.map((game, index) => (
                  <CustomButton
                    key={index}
                    onClick={() => setGame(game)}
                    value={game}
                    margin={'m-6'}
                  />
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
        <CustomButton onClick={createRoom} value={'Create Room'}
        />
    </div>
  );
};

export default CreateRoom;