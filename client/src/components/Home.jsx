/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useUser } from '../assets/UserContext';
import UpdatePointsButton from './UpdatePointsButton';

const Home = () => {
  const { user } = useUser();

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
