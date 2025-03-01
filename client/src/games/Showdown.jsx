/* eslint-disable react-hooks/exhaustive-deps */
import { Loader } from 'lucide-react';
import { useEffect, useState } from "react";
import { useUser } from "../assets/UserContext";
import axios from 'axios';
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const Showdown = () => {
  const { user } = useUser();
  const { key } = useParams();
  const [round, setRound] = useState(1);
  const [inputRounds, setInputRounds] = useState(64);
  const [images, setImages] = useState([]);
  const [roomDetails, setRoomDetails] = useState({ participants: [] });
  const [winningImage, setWinningImage] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [endGame, setEndGame] = useState(false);
  const storedRoomKey = localStorage.getItem('roomKey');

  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
  const socket = io(API_URL);
  let array = [];

  const getRoomDetails = async () => {
      try {
          if (!key) return;
          console.log('Room key: ', key);
          const response = await axios.post(`${API_URL}/${key}`);
          const data = response.data;

          if (data.success) {
              setRoomDetails(data.room);
          }
          else {
              console.error('Error getting room name: ', data.error);
          }
      } catch (err) {
          console.error('Error fetching room details:', err);
      }
  };

  const startGame = async () => {
    setIsGameStarted(true);
    try {
      const response = await axios.get(`${API_URL}/top-profiles`, { params: { q: inputRounds } });
      const data = response.data;

      for (let user of data.users) {
        array.push({
          pfp: user.pfp,
          user: user.username,
          points: user.points
        });
      }

      if (array.length > 0) {
        setImages(array.map(item => item.pfp));
      }
      if (array[0].points > array[1].points) {
        setWinningImage(array[0].pfp);
      }
      else {
        setWinningImage(array[1].pfp);
      }
    } catch (err) {
      console.error('Error getting the fetched images', err);
    }
  };

  const goNext = (data) => {
    if (data === winningImage) {
      console.log('Correct');
      setRound((prevRound) => prevRound + 1);
      setImages((prevImages) => prevImages.slice(2));
    }
    else {
      console.log('Incorrect');
      setEndGame(true);
    }
  };

  // Loads everytime images array gets sliced to calculate which one is the winner for this round
  useEffect(() => {
    if (array.length >= 2) {
      if (array[0].points > array[1].points) {
        setWinningImage(array[0].pfp);
      }
      else {
        setWinningImage(array[1].pfp);
      }
    }
  }, [images]);

  useEffect(() => {
    const handleChosen = (data) => {
      goNext(data.pfp[0]);
    };
  
    socket.on('chosen', handleChosen);

    return () => {
      socket.off('chosen', handleChosen);
    };
  }, [socket]);

  useEffect(() => {
    getRoomDetails();
  }, [key]);

  if (!isGameStarted) {
    if (roomDetails.creator == user.username) {
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
    else {
      return (
        <>
          <h2 className="text-white font-bold text-3xl">Waiting for the host to start the game...</h2>
          <Loader className='mt-7 size-6 animate-spin mx-auto text-white' />
        </>
      );
    }
  }
  else {
    return (
      <>
        <h2 className='text-white font-bold text-5xl'>Showdown battle!</h2>
          {!endGame ? (
            <>
              <h2 className='text-white font-bold text-3xl'>Round {round} of {inputRounds}</h2>
              <div className='flex items-center justify-center rounded-lg gap-12 mt-8'>
                <img
                  className='cursor-pointer rounded-full w-48 h-48'
                  src={images[0]}
                  alt='Left'
                  onClick={() => socket.emit('chosen', { key: storedRoomKey, user: user.username, pfp: images[0] })}
                />
                <img
                  className='cursor-pointer rounded-full w-48 h-48'
                  src={images[1]}
                  alt='Right'
                  onClick={() => socket.emit('chosen', { key: storedRoomKey, user: user.username, pfp: images[1] })}
                />
              </div>
            </>
          ) : (
            <>
              <h2 className='text-white text-3xl font-bold mt-4'>Game Over!</h2>
            </>
          )}
      </>
    );
  }
};

export default Showdown;
