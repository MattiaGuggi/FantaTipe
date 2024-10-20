/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '../assets/UserContext';
import UpdatePointsButton from './UpdatePointsButton';
import Dashboard from './Dashboard';

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
    <>
      {user.username === 'Guggi' ? (
        <>
          <Dashboard />
          <div className='flex justify-center items-center mt-10 w-full h-auto xs:mt-4'>
            <UpdatePointsButton />
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
