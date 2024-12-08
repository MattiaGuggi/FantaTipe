import { useState } from 'react';
import axios from 'axios';

const GuessSong = () => {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

  const searchSongs = async (searchTerm) => {
    try {
      const response = await axios.get(`${API_URL}/search-song`, { params: { q: searchTerm } });
      const data = response.data;

      setSongs(data.songs.data.splice(0, 10));
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const reproduceSong = async (previewUrl) => {
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

  return (
    <div>
      <h1 className='font-bold text-white text-2xl mb-4 -mt-20 xs:mb-2'>Search for a Song</h1>
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
            <li key={song.id} onClick={() => reproduceSong(song.preview)}
              className={`relative cursor-pointer py-3 PX-2 border transition-all duration-300 transform
                ${index === 0 ? 'rounded-tl-[15px] rounded-tr-[15px]' : ''} 
                ${index === songs.length-1 ? 'rounded-bl-[15px] rounded-br-[15px]' : ''} `}
            >
              <div className={`absolute inset-0 bg-black bg-opacity-50 opacity-0 transition-all duration-300 hover:opacity-60 
                ${index === 0 ? 'rounded-tl-[15px] rounded-tr-[15px]' : ''} 
                ${index === songs.length-1 ? 'rounded-bl-[15px] rounded-br-[15px]' : ''} `}></div>
              {song.title} - {song.artist.name}
            </li>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default GuessSong;
