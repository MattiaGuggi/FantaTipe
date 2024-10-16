/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useUser } from '../assets/UserContext';
import UpdatePointsButton from './UpdatePointsButton';
import { io } from 'socket.io-client';

const Home = () => {
  const { user } = useUser();
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5173" : "";

  useEffect(() => {
    const socket = io(API_URL);

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });
    
    // Listen for admin event notifications
    socket.on('admin-event', (data) => {
      alert(data.message);
    });

    // Clean up the connection when component unmounts
    return () => socket.off('admin-event');
  }, []);

  return (
    <div>
      <div className='text-center'>
        <h1 className='text-5xl font-bold'>Welcome to the Home Page</h1>
        <p className='font-semibold text-6xl'>FantaTipe</p>
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
