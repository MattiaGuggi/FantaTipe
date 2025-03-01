/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../assets/UserContext';

const Games = ({ isGameStarted, setIsGameStarted }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [roomStatus, setRoomStatus] = useState('');
    const [roomDetails, setRoomDetails] = useState({ participants: [] });
    const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
    const storedRoomKey = localStorage.getItem("roomKey");
    const storedParticipant = localStorage.getItem("participant");
    const [isTouch, setIsTouch] = useState(false);

    const getRoomDetails = async (key) => {
        try {
            if (!key) return;
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

  const room = (status) => {
    if (status === "create") {
      navigate("/create-room");
    }
    else if (status === "join") {
        if (user.username === storedParticipant) {
            // If the game is not started yet, then go to the room
            // The room's status has been checked when the component was mounted
            alert('You are redirected to your previous room');
            navigate(`/${storedRoomKey}`);
        }
        else if (roomStatus === "active") {
            alert("This room is already active. You cannot join an active game.");
            return;
        }

        // Check if the user has a stored room key and participant name
        if (!isGameStarted) {
            // If no key, then go and put one
            if (!storedRoomKey) {
                navigate("/join-room");
            }
            // If different user logged in now
            else {
                localStorage.setItem("participant", user.username);
                navigate("/join-room");
            }
        }
        else {
            navigate(`/${roomDetails?.game.toLowerCase().replace(' ', '-')}`);
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
            getRoomDetails(storedRoomKey);
        }
        if (storedRoomKey && !isGameStarted) {
            getRoomStatus(storedRoomKey);
            if (roomStatus === 'active')
                setIsGameStarted(true);
            }
    }, []);
    
    useEffect(() => {
      const handleTouch = () => setIsTouch(true);
      window.addEventListener("touchstart", handleTouch);
      
      return () => window.removeEventListener("touchstart", handleTouch);
    }, []);

  // isGameStarted is automatically true only if he has the key in the session

  // 2 cases of game already started:
  // 1. The user has the key in the session and joins automatically the started game
  // 2. The user needs to insert the room key and then automatically joins the started game

  return (
    <>
        <div className='flex'>
            <div className={`flex items-center justify-center cursor-pointer py-5 px-8 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white m-4
                font-bold rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2
                focus:ring-offset-gray-900 transition-all duration-200
                ${!isTouch ? 'hover:from-indigo-800 hover:to-indigo-950 hover:scale-110' : ''}`}
                onClick={() => room("create")}>
                Create Room
            </div>
            <div className={`flex items-center justify-center cursor-pointer py-5 px-8 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white m-4
                font-bold rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2
                focus:ring-offset-gray-900 transition-all duration-200
                ${!isTouch ? 'hover:from-indigo-800 hover:to-indigo-950 hover:scale-110' : ''}`}
                onClick={() => room("join")}>
                Join Room
            </div>
        </div>
    </>
  )
};

export default Games;