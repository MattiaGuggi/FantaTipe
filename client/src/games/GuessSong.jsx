import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useUser } from '../assets/UserContext';

const GuessSong = () => {
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState('');
  const [currentAudio, setCurrentAudio] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [allReady, setAllReady] = useState(false);
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
  const socket = io(API_URL);
  const array = [];
  const storedRoomKey = localStorage.getItem('roomKey');

  const searchSongs = async (searchTerm) => {
    try {
      const response = await axios.get(`${API_URL}/search-song`, { params: { q: searchTerm } });
      const data = response.data;

      setSongs(data.songs.data.splice(0, 7));
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const reproduceSong = async (songName, songArtist, previewUrl) => {
    setSelectedSong(`${songName}-${songArtist}`);
    try {
      if (currentAudio) {
        currentAudio.pause();
      }

      const audio = new Audio(previewUrl);
      audio.play();
      setCurrentAudio(audio);
    } catch (err) {
      console.error('Error reproducing song', err);
    }
  };

  const chooseSong = async (title) => {
    setConfirmed(true);
    array.push({
      player: title.split('-')[1],
      song: title.split('-')[0]
    });
    socket.emit('ready', { key: storedRoomKey, user: user.username });
  };

  useEffect(() => {
    socket.on('allReady', () => {
      setAllReady(true);
    });
    socket.on('notReady', (data) => {
      const len = data.ready;
      console.log(len);
    });
  }, [socket]);

  // First step: choose a song
  if (!confirmed) {
    return (
      <div>
        <h1 className='font-bold text-white text-2xl mb-4 -mt-32 xs:mb-2'>Search for a Song</h1>
        <h3 className='text-white mb-2'>Warning: to select the song, click on the song without audio or it will be revealed</h3>
        <input
          type="text"
          placeholder="Search for a song"
          value={query}
          className='w-full pl-4 pr-10 py-2 bg-opacity-50 text-black rounded-lg border border-gray-700 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700
            placeholder-gray-400 transition duration-200 xs:w-5/6'
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
              <li key={song.id} onClick={() => reproduceSong(song.title, song.artist.name, song.preview)}
                className={`relative cursor-pointer py-3 px-2 border transition-all duration-300 transform
                  ${index === 0 ? 'rounded-tl-[15px] rounded-tr-[15px]' : ''} 
                  ${index === songs.length - 1 ? 'rounded-bl-[15px] rounded-br-[15px]' : ''} `}
              >
                <div className={`absolute inset-0 bg-black bg-opacity-50 opacity-0 transition-all duration-300 hover:opacity-60 
                  ${index === 0 ? 'rounded-tl-[15px] rounded-tr-[15px]' : ''} 
                  ${index === songs.length - 1 ? 'rounded-bl-[15px] rounded-br-[15px]' : ''} `}></div>
                {song.title} - {song.artist.name}
              </li>
            </div>
          ))}
        </ul>
        <div className='flex justify-center items-center w-full'>
          <div className='w-3/4 flex items-center justify-center py-3 px-10 text-white text-lg font-bold'
          >
            Selected Song: {selectedSong ? selectedSong : 'None'}
          </div>
        </div>
        <button className='text-md mt-2 p-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg
          hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:ring-offset-gray-900
            transition-all duration-200 hover:scale-110'
          onClick={() => chooseSong(selectedSong)}>
          Choose selected song
        </button>
      </div>
    );
  }
  // Second step: wait for all players
  else if (!allReady) {
    return (
      <>
        <h2 className='text-white text-2xl'>Waiting for other players...</h2>
      </>
    );
  }
  // Third step: game logic
  else {
    return (
      <>
        <div className='text-white text-xl font-bold'>Game Started!</div>
        {array.map((element, index) => (
          <div key={index} className=''>
            <div className='text-white text-lg'>User: {element.player}</div>
            <div className='text-white text-lg'>Song: {element.song}</div>
          </div>
        ))}
      </>
    )
  }
};

export default GuessSong;   
