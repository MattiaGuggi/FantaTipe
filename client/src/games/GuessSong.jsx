/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useUser } from '../assets/UserContext';

const GuessSong = () => {
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState('');
  const [guessedSong, setGuessedSong] = useState('');
  const [round, setRound] = useState(0);
  const [songs, setSongs] = useState([]);
  const [array, setArray] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [allReady, setAllReady] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timer, setTimer] = useState(30);
  const [endGame, setEndGame] = useState(false); // Added endGame state

  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
  const socket = io(API_URL);
  const storedRoomKey = localStorage.getItem('roomKey');

  const searchSongs = async (searchTerm) => {
    try {
      const response = await axios.get(`${API_URL}/search-song`, { params: { q: searchTerm } });
      const data = response.data;
      setSongs(data.songs.data.splice(0, 7));
    } catch (error) {
      console.error('Error fetching songs:', error);
      alert('Failed to fetch songs. Please try again.');
    }
  };

  const reproduceSong = async (songName, songArtist, previewUrl) => {
    setSelectedSong(`${songName}-${songArtist}`);
    try {
      if (currentAudio?.audio) {
        currentAudio.audio.pause();
      }
      const audio = new Audio(previewUrl);
      audio.play();
      setCurrentAudio({audio: audio, url: previewUrl});
    } catch (err) {
      console.error('Error reproducing song', err);
    }
  };

  const chooseSong = async (title) => {
    setConfirmed(true);
    currentAudio.audio.pause();
    let temp = [{
      player: title.split('-')[1],
      song: title.split('-')[0],
      url: currentAudio.url,
    }];
    socket.emit('ready', { key: storedRoomKey, user: user.username, array: temp });
  };

  const shuffle = (array) => {
    const shuffled = array.slice();
    for (let i = 0; i < shuffled.length - 1; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const playRoundSong = () => {
    console.log('Playing song for round ', round);
    // Stop any currently playing audio
    if (currentAudio?.audio) {
      currentAudio.audio.pause();
    }
  
    // Get the audio preview URL of the current round's song
    const currentSong = array[round];
    if (currentSong?.url) {
      if (currentAudio?.audio) {
        currentAudio.audio.pause();
      }

      const newAudio = new Audio(currentSong.url);
      newAudio.currentTime = 0; // Restart the song from the beginning
      newAudio.play();
      setCurrentAudio({ audio: newAudio, url: currentSong.url});
    }
  };

  const startRound = () => {
    // Check if the round exceeds or matches the number of songs
    if (round >= array.length) {
      setIsRevealed(true);
      setEndGame(true); // Set endGame to true when the game finishes
      return;
    }
  
    setIsRevealed(false);
    setTimer(30);
    playRoundSong();
  
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIsRevealed(true);
  
          setTimeout(() => {
            setRound((prevRound) => {
              const newRound = prevRound + 1;
              if (newRound < array.length) {
                playRoundSong(); // Play the next song after the delay
                return newRound;
              } else {
                setEndGame(true); // End the game if no more songs are left
                return prevRound;
              }
            });
          }, 5000);
  
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };  

  useEffect(() => {
    socket.on('allReady', (data) => {
      setAllReady(true);
      setArray(data.array);
    });
  }, [socket]);

  useEffect(() => {
    if (allReady) {
      setArray(shuffle(array));
      startRound();
    }
  }, [allReady]);

  if (!confirmed) {
    return (
      <div>
        <h1 className='font-bold text-white text-2xl mb-4 -mt-32 xs:mb-2'>Search for a Song</h1>
        <h3 className='text-white mb-2'>Warning: to select the song, click on the song without audio or it will be revealed</h3>
        <input
          type="text"
          placeholder="Search for a song"
          value={query}
          className='w-full pl-4 pr-10 py-2 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700 placeholder-gray-400 transition duration-200 xs:w-5/6'
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value) {
              searchSongs(e.target.value);
            }
            else {
              setSongs([]);
            }
          }}
        />
        <ul className='m-4'>
          {songs.map((song, index) => (
            <div key={index}>
              <li
                key={song.id}
                onClick={() => reproduceSong(song.title, song.artist.name, song.preview)}
                className={`relative cursor-pointer py-3 px-2 border transition-all duration-300 transform ${
                  index === 0 ? 'rounded-tl-[15px] rounded-tr-[15px]' : ''
                } ${index === songs.length - 1 ? 'rounded-bl-[15px] rounded-br-[15px]' : ''}`}
              >
                <div className={`absolute inset-0 bg-black bg-opacity-50 opacity-0 transition-all duration-300 hover:opacity-60 ${
                  index === 0 ? 'rounded-tl-[15px] rounded-tr-[15px]' : ''
                } ${index === songs.length - 1 ? 'rounded-bl-[15px] rounded-br-[15px]' : ''}`}></div>
                {song.title} - {song.artist.name}
              </li>
            </div>
          ))}
        </ul>
        <div className='flex justify-center items-center w-full'>
          <div className='w-3/4 flex items-center justify-center py-3 px-10 text-white text-lg font-bold'>
            Selected Song: {selectedSong || 'None'}
          </div>
        </div>
        <button
          className='text-md mt-2 p-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 transition-all duration-200 hover:scale-110'
          onClick={() => chooseSong(selectedSong)}
        >
          Choose selected song
        </button>
      </div>
    );
  }
  else if (!allReady) {
    return <h2 className='text-white text-2xl'>Waiting for other players...</h2>;
  }
  else {
    return (
      <>
        <h2 className='text-white font-bold text-5xl'>Guess the song!</h2>
        <h3 className='text-white text-2xl mb-2'>
          {endGame ? 'Game Finished!' : `Time left: ${timer}s`}
        </h3>
        <input
          type="text"
          value={guessedSong}
          placeholder="Guess the song!"
          className='w-1/4 pl-4 m-12 pr-10 py-2 bg-opacity-50 text-black rounded-lg border'
          onChange={(e) => setGuessedSong(e.target.value)}
        />
        {isRevealed && (
          <div className='text-white mt-4'>
            {array[round]?.song.toLowerCase() === guessedSong.toLowerCase() ? 'Correct!' : 'Wrong!'}
            <p>Correct Answer: {array[round]?.song}</p>
          </div>
        )}
      </>
    );
  }
};

export default GuessSong;
