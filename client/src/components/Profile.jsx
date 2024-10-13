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

  const modifyProfile = () => {
    setIsModalOpen(true);
  };

  const handleSave = async (updatedUser) => {
    try {
      const response = await fetch('http://localhost:8080/update-profile', { // Send the updated user data to the server
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
    <div className='absolute font-extrabold text-4xl flex flex-col items-center justify-center top-16 w-80 h-3/5 mt-12'>
      <LogOut className='absolute top-0 cursor-pointer -right-96 xs:right-4' onClick={() => redirect()}/>
      <p className='mt-0'>{user.username}</p>
      <p className='mt-6 mb-12'>{user.points} points</p>
      <img src={user.pfp} alt="Profile Picture" className='rounded-full w-52 h-52 xs:w-40 xs:h-40' />
      <button className='bg-white backdrop-filter backdrop-blur-md bg-opacity-10 p-2 rounded-xl mt-10 text-base xs:font-semibold' onClick={modifyProfile}>Modify profile</button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} handleSave={handleSave} />
    </div>
  );
};

export default Profile;