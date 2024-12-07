import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Demo = ({ isGameStarted, setIsGameStarted }) => {
  const navigate = useNavigate();
  const [roomStatus, setRoomStatus] = useState('');
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
  const storedRoomKey = localStorage.getItem("roomKey");

  const room = (status) => {
    if (status === "create") {
      navigate("/create-room");
    }
    else if (status === "join") {
      // Check if the user has a stored room key and participant name

      // If no key, then go and put one
      if (!storedRoomKey) {
        navigate("/join-room");
      }
      else {
        // If the game is not started yet, then go to the room
        // The room's status has been checked when the component was mounted
          navigate(`/${storedRoomKey}`);
      }
    }
  };

  // Instantly checks if the game of the room he has the key is started or not
  useEffect(() => {
    const getRoomStatus = async (key) => {
      try {
        if (!key) return;
        const response = await axios.post(`${API_URL}/${key}`);
        const data = response.data;
  
        if (data.success) {
          setRoomStatus(data.room.status);
        }
      } catch (err) {
          console.error('Error getting room status:', err);
      }
    };
    const getRoom = async (key) => {
      try {
        if (!key) return;
        const response = await axios.post(`${API_URL}/${key}`);
        const data = response.data;
  
        if (!data.success) {
          setIsGameStarted(false);
        }
      } catch (err) {
          console.error('Error getting room status:', err);
      }
    };

    // Check if the room still exists
    if (storedRoomKey && isGameStarted) {
      getRoom(storedRoomKey);
      localStorage.removeItem('roomKey');
    }
    if (storedRoomKey && !isGameStarted) {
      getRoomStatus(storedRoomKey);
      if (roomStatus === 'active')
        setIsGameStarted(true);
    }
  });

  // isGameStarted is automatically true only if he has the key in the session

  // 2 cases of game already started:
  // 1. The user has the key in the session and joins automatically the started game
  // 2. The user needs to insert the room key and then automatically joins the started game

  return (
    <>
      {!isGameStarted ? (
        <>
          <div className='text-white font-bold text-3xl mb-12'>Demo</div>
          <div className='flex'>
            <div className='flex items-center justify-center cursor-pointer py-5 px-8 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white m-4
                font-bold rounded-2xl shadow-lg hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2
              focus:ring-offset-gray-900 transition-all duration-200 hover:scale-110'
              onClick={() => room("create")}>
                Create Room
            </div>
            <div className='flex items-center justify-center cursor-pointer py-5 px-8 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white m-4
                font-bold rounded-2xl shadow-lg hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2
                focus:ring-offset-gray-900 transition-all duration-200 hover:scale-110'
              onClick={() => room("join")}>
                Join Room
            </div>
          </div>
        </>
      ) : (
        <>
          <div className='text-white font-bold text-3xl mb-12'>Game Started!</div>
        </>
      )}
    </>
  )
};

export default Demo;