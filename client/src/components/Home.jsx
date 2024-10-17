/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { useUser } from '../assets/UserContext';
import UpdatePointsButton from './UpdatePointsButton';
import { io } from 'socket.io-client';

const Home = () => {
  const { user } = useUser();
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
  const newSocket = io(API_URL);

  useEffect(() => {
    // Listen for points update
    newSocket.on('message', (data) => {
      alert(`${data.message}`);
    });

    return () => newSocket.close();
  }, [newSocket]);

  return (
    <div>
      <div className='text-center'>
        <h1 className='text-5xl font-bold text-white'>Welcome to the Home Page</h1>
        <p className='font-semibold text-6xl text-white'>FantaTipe</p>
      </div>
      {user.username === 'Guggi' ? (
        <div className='flex justify-center items-center mt-10 w-full h-auto'>
          <UpdatePointsButton />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Home;
