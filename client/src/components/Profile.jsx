/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useUser } from '../assets/UserContext'; // Import useUser
import Modal from '../assets/Modal';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Profile = ({ redirectToLogin }) => {
  const { user, setUser } = useUser(); // Destructure setUser from useUser
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

  const modifyProfile = () => {
    setIsModalOpen(true);
  };

  const handleSave = async (updatedUser) => {
    try {
      const response = await fetch(`${API_URL}/update-profile`, { // Send the updated user data to the server
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);  // Update the user context with the new data
      }
      else {
        console.log('Failed to update profile:', data.message);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const redirect = () => {
    redirectToLogin();
    navigate('/login');
  }

  return (
    <>
      <LogOut className='absolute text-white top-28 right-60 cursor-pointer translate-x-3/4 xs:right-12 transition-all duration-200 hover:scale-125' onClick={() => redirect()}/>
      <div className='absolute font-extrabold text-4xl flex flex-col items-center justify-center top-16 w-80 h-3/5 mt-12'>
        <p className='text-white mt-0'>{user.username}</p>
        <p className='text-white mt-6 mb-12'>{user.points} points</p>
        <img src={user.pfp} alt="Profile Picture" className='rounded-full w-52 h-52 xs:w-40 xs:h-40' />
        <div className='relative mt-10'>
          <button
            className='text-md mt-8 px-8 py-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg
              hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:ring-offset-gray-900
              transition duration-200 hover:scale-110 relative bg-white backdrop-filter backdrop-blur-md bg-opacity-10 text-base p-4
            hover:bg-indigo-500 hover:bg-opacity-10 xs:mt-0 xs:font-semibold'
            onClick={modifyProfile}
          >
            Modify Profile
          </button>
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user|| { username: '', points: '', pfp: '', password: '' }} handleSave={handleSave} />
      </div>
    </>
  );
};

export default Profile;