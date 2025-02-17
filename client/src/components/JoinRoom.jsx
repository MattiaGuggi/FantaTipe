import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUser } from '../assets/UserContext';
import { io } from 'socket.io-client';
import { ArrowUpAZ } from 'lucide-react'
import Input from '../assets/Input';
import CustomButton from '../assets/CustomButton';

const JoinRoom = ({ setRoom }) => {
    const { user } = useUser();
    const [key, setKey] = useState('');
    const [participant, setParticipant] = useState('');
    const navigate = useNavigate();
    const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
    const socket = io(API_URL);
    
    const clearLocalStorage = () => {
        localStorage.removeItem("roomKey");
        localStorage.removeItem("participant");
    };
    

    const joinRoom = async () => {
        // If the participant who logged previously was a different one from now, change him
        if (participant !== user.username) {
            setParticipant(user.username);
        }
        try {
            if (!key || !participant) return;
            const response = await axios.post(`${API_URL}/join-room`, { key, participant });
            const data = response.data;

            if (data.success) {
                setRoom(data.room);

                // If the game hasn't started yet then go to the room
                if (data.room.status === 'waiting')
                    navigate(`/${data.room.key}`);
                // If not, join the started game
                else {
                    navigate(`/${data.room.game.toLowerCase().replace(' ', '-')}`);
                }

                // Store the room key and participant name in localStorage
                localStorage.setItem("roomKey", data.room.key);
                localStorage.setItem("participant", participant);

                socket.emit('userJoined', { key: key, participant: participant });
            }
            else {
                alert(data.message);
            }
        } catch (err) {
            alert(err.response?.data?.error);
            console.error('Error joining room:', err);
        }
    };

  useEffect(() => {
      // Retrieve the stored room key from localStorage
      const storedRoomKey = localStorage.getItem("roomKey");
      const storedParticipant = localStorage.getItem("participant");
  
      if (storedRoomKey) {
          setKey(storedRoomKey);
          setParticipant(storedParticipant);
      }
      
      // Cleanup localStorage when the user disconnects
      const handleBeforeUnload = () => {
          clearLocalStorage();
      };
      
      window.addEventListener("beforeunload", handleBeforeUnload);
  
      // Cleanup the event listener when the component unmounts
      return () => {
          window.removeEventListener("beforeunload", handleBeforeUnload);
      };
  }, []);

  return (
    <div>
        <h2 className='text-white font-bold text-2xl mb-5'>Join a Private Room</h2>
        <Input
            icon={ArrowUpAZ}
            type="text"
            placeholder="Room Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
        />
        <CustomButton onClick={() => joinRoom()} value={'Join Room'} margin={'mt-10'}
        />
    </div>
  );
};

export default JoinRoom;