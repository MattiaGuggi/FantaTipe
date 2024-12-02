import { useState } from 'react';
import axios from 'axios';

const JoinRoom = () => {
  const [key, setKey] = useState('');
  const [participant, setParticipant] = useState('');
  const [room, setRoom] = useState(null);
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

  const joinRoom = async () => {
    try {
        const response = await axios.post(`${API_URL}/join-room`, { key, participant });
        const data = await response.json();
      
        if (data.success)
            setRoom(data.room);
        else
            console.error('Error joining room: ', data.message);
    } catch (err) {
      console.error('Error joining room:', err);
    }
  };

  return (
    <div>
      <h2>Join a Room</h2>
      <input
        type="text"
        placeholder="Room Key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />
      <input
        type="text"
        placeholder="Your Name"
        value={participant}
        onChange={(e) => setParticipant(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
      {room && <p>Joined Room: {room.key}</p>}
    </div>
  );
};

export default JoinRoom;
