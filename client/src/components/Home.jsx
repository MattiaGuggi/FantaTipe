/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '../assets/UserContext';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import CustomButton from '../assets/CustomButton';

const Home = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
  const socket = io(API_URL);

  const handleUpdatePoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/update-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(data.message);
        setUser(data.user);
        socket.emit('message', { message: 'Refresh the page for points update!' });
      }
    } catch (err) {
      console.error('Error updating points: ', err);
      setError('Failed to update points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Listen for points update
    socket.on('message', (data) => {
      alert(`${data.message}`);
      navigate('/home');
    });

    return () => {
      socket.off('message');
      socket.disconnect();
  };
  }, [socket]);

  return (
    <>
      {user.username === 'Guggi' ? (
        <>
          <Dashboard />
          <div className='flex justify-center items-center mt-10 w-full h-auto xs:mt-4'>
            <div className='updateButton'>
              <CustomButton
                onClick={handleUpdatePoints}
                value={loading ? <Loader className='size-6 animate-spin mx-auto' /> : 'Update Points'}
                margin={'mb-48'}
              />
              {error && <p className="text-red-500">{error}</p>}
              {message && <p className="text-green-500">{message}</p>}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className='flex justify-center items-center mt-10 w-full h-auto text-4xl text-white font-bold'>Welcome to the home page</div>
        </>
      )}
    </>
  );
};

export default Home;
