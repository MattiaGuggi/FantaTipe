import { useEffect, useState } from "react";
import { useUser } from "../assets/UserContext";
import axios from 'axios';
import { io } from "socket.io-client";

const Showdown = () => {
  const { user } = useUser();
  const [round, setRound] = useState(1);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [inputRounds, setInputRounds] = useState(64);
  const [images, setImages] = useState([]);
  const storedRoomKey = localStorage.getItem('roomKey');

  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
  const socket = io(API_URL);

  const startGame = async () => {
    setIsGameStarted(true);
    try {
      const response = await axios.get(`${API_URL}/top-profiles`, { params: { q: inputRounds } });
      const data = response.data;
      let array = [];

      for (let user of data.users) {
        array.push(user.pfp);
      }

      setImages(array);
    } catch (err) {
      console.error('Error getting the fetched images', err);
    }
  };

  const goNext = (data) => {
    // Need to check if both put correct answer, if not one wins
    setImages((prevImages) => prevImages.slice(2));
    setRound((prevRound) => prevRound++);
  };

  useEffect(() => {
    socket.on('chosen', (data) => {
      console.log(data);
      goNext(data.link);
    });
  }, [socket]);

  if (!isGameStarted) {
    return (
      <>
        <input
          className='w-1/4 pl-4 m-12 pr-10 py-2 bg-opacity-50 text-black rounded-lg border'
          type='number'
          placeholder='Inserisci numero di round'
          value={inputRounds}
          onChange={(e) => setInputRounds(e.target.value)}
        />
        <button
          className='text-md mt-2 p-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 transition-all duration-200 hover:scale-110'
          onClick={startGame}
        >
          Start Game
        </button>
      </>
    );
  }
  else if (images.length < 2) {
    return (
      <h2 className='text-white font-bold text-5xl mt-8'>Game Over!</h2>
    );
  }
  else {
    return (
      <>
        <h2 className='text-white font-bold text-5xl'>Showdown battle!</h2>
        <h2 className='text-white font-bold text-3xl'>Round {round} of {inputRounds}</h2>
        <div className='flex items-center justify-center rounded-lg gap-12 mt-8'>
        <img
          className='cursor-pointer rounded-full w-48 h-48'
          src={images[0]}
          alt='Left'
          onClick={() => socket.emit('chosen', { key: storedRoomKey, link: images[0], user: user.username })}
        />
        <img
          className='cursor-pointer rounded-full w-48 h-48'
          src={images[1]}
          alt='Right'
          onClick={() => socket.emit('chosen', { key: storedRoomKey, link: images[1], user: user.username })}
        />
        </div>
      </>
    );
  }
};

export default Showdown;
