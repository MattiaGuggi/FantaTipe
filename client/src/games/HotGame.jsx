/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../assets/UserContext';
import Input from '../assets/Input';
import { ArrowUp10 } from 'lucide-react';

const hotGame = () => {
  const { user } = useUser();
    const { key } = useParams();
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [endGame, setEndGame] = useState(false);
  const [inputRounds, setInputRounds] = useState(64);
  const [currentRound, setCurrentRound] = useState(0);
  const [points, setPoints] = useState(0);
  const [images, setImages] = useState([]);
  const [chosenImage, setChosenImage] = useState('');
  const storedRoomKey = localStorage.getItem('roomKey');
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
  const socket = io(API_URL);

  const startGame = async () => {
    setIsGameStarted(true);
    try {
      const response = await axios.get(`${API_URL}/top-profiles`, { key: storedRoomKey });
      const data = response.data;
      let temp = [];

      for (let user of data.users) {
        temp.push({
          pfp: user.pfp,
          user: user.username,
          points: user.points
        });
      }

      if (temp.length > 0) {
        setImages(temp.map(item => item.pfp));
      }

      // Re-set the number of rounds to the number of images it could find (maybe not yet enough users)
      setInputRounds(temp.length);
    } catch(err) {
      console.error('Error starting game', err);
    }
  };

  const chooseImage = async (selectedImage) => {
    try {
      setChosenImage(selectedImage);
      socket.emit('ready', { key: storedRoomKey, user: user.username, array: [selectedImage] });
    } catch (err) {
      console.error('Error choosing the image', err);
    }
  };

  const handleWinningImage = async (chosenImages) => {
    try {
      // Need to find the most repeated image
      let firstCount = 0, secondCount = 0, oldImage = chosenImages[0], otherImage = null;
      for (let i=1 ; i<chosenImages.length ; i++) {
        if (chosenImages[i] === oldImage) {
          firstCount++;
        }
        else {
          secondCount++;
          otherImage = chosenImages[i];
        }
      }

      socket.emit('winningImage', { url: firstCount > secondCount ? oldImage : otherImage });
    } catch (err) {
      console.error('Error setting winning image', err);
    }
  };

  useEffect(() => {
    const handleReadiness = (data) => {
      handleWinningImage(data.array);
      setCurrentRound((prev) => prev + 1);
      setEndGame(currentRound == inputRounds ? true : false);
      socket.emit('clear', { key: storedRoomKey });
    };
    
    socket.on('allReady', handleReadiness);
    
    socket.on('winningImage', (data) => {
      if (chosenImage === data.url)
        setPoints((prev) => prev + 1);
    });

    return () => {
      socket.off('chosen', handleReadiness);
    };
  }, [socket]);

  if (!isGameStarted) {
    return (
      <>
        <Input
          icon={ArrowUp10}
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
          <h2 className='text-white font-bold text-5xl'>Hot Game!</h2>
          {!endGame ? (
            <>
              <h2 className='text-white font-bold text-3xl'>Round {currentRound} of {inputRounds}</h2>
              <div className='flex items-center justify-center rounded-lg gap-12 mt-8'>
                <img
                  className='cursor-pointer rounded-full w-48 h-48'
                  src={images[0]}
                  alt='Left'
                  onClick={() => chooseImage(images[0])}
                />
                <img
                  className='cursor-pointer rounded-full w-48 h-48'
                  src={images[1]}
                  alt='Right'
                  onClick={() => chooseImage(images[1])}
                />
              </div>
            </>
          ) : (
            <>
              <h2 className='text-white text-3xl font-bold mt-4'>Game Over!</h2>
              <h2 className='text-white text-2xl font-bold mt-4'>Your Point: {points}</h2>
            </>
          )}
      </>
    )
  }
}

export default hotGame