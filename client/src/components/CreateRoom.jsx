import { useState } from 'react';
import axios from 'axios';

const CreateRoom = () => {
  const [creator, setCreator] = useState('');
  const [roomKey, setRoomKey] = useState(null);
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

  const createRoom = async () => {
    try {
        const response = await axios.post(`${API_URL}/create-room`, { creator });
        const data = await response.json();

        if (data.success)
            setRoomKey(data.roomKey);
        else
            console.error('Error creating room: ', data.message);
    } catch (err) {
      console.error('Error creating room:', err);
    }
  };

  return (
    <div>
      <h2>Create a Private Room</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={creator}
        onChange={(e) => setCreator(e.target.value)}
      />
      <button onClick={createRoom}>Create Room</button>
      {roomKey && <p>Room Key: {roomKey} (Share this with others)</p>}
    </div>
  );
};

export default CreateRoom;
