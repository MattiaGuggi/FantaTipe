import React, { useEffect, useState } from 'react';
import { useUser } from '../assets/UserContext';
import axios from 'axios';
import Modal from '../assets/Modal';
import MalusModal from '../assets/MalusModal';
import { useNavigate } from 'react-router-dom';
import { Loader, LogOut } from 'lucide-react';
import CustomButton from '../assets/CustomButton';

const Profile = ({ redirectToLogin }) => {
  const { user, setUser } = useUser();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMalusModalOpen, setIsMalusModalOpen] = useState(false);
  const [myMalus, setMyMalus] = useState([]);
  const navigate = useNavigate();
  const API_URL = import.meta.env.MODE === 'development' ? 'http://localhost:8080' : '';

  useEffect(() => {
    const getMalus = async () => {
      try {
        const response = await axios.get(`${API_URL}/get-my-malus`, { params: { email: user.email } });
        const data = response.data;
        if (data.success) {
          setMyMalus(data.myMalus || []);
        }
        else {
          console.error('Error fetching malus:', data.message);
        }
      } catch (error) {
        console.error('Error fetching malus:', error);
      }
    };
    if (user) getMalus();
  }, [user]);

  const getUserPfp = async (username) => {
    if (username === user.username) return user.pfp;
  
    try {
      const response = await axios.get(`${API_URL}/get-users`);
      if (response.status === 200) {
        const foundUser = response.data.users.find((usr) => usr.username === username);
        return foundUser?.pfp || '';
      }
    } catch (err) {
      console.error('Error fetching user pfp:', err);
    }
    return '';
  };
  
  useEffect(() => {
    const fetchPfps = async () => {
      const updatedPfps = {};
      for (const username of myMalus) {
        const pfp = await getUserPfp(username);
        updatedPfps[username] = pfp;
      }
      setPfps(updatedPfps);
    };

    if (myMalus.length > 0)
      fetchPfps();
  }, [myMalus]);

  const handleSaveProfile = async (updatedUser) => {
    try {
      const response = await fetch(`${API_URL}/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      const data = await response.json();
      if (data.success) setUser(data.user);
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSaveMalus = async (newMalus) => {
    const updatedMalus = newMalus.myMalus;

    try {
      const params = {
        email: user?.email,
        myMalus: updatedMalus
      };
      const response = await fetch(`${API_URL}/update-my-malus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      if (data.success) setUser(data.user);
      setIsMalusModalOpen(false);
    } catch (err) {
      console.error('Error saving malus:', err);
    }
  };

  const redirect = () => {
    redirectToLogin();
    navigate('/login');
  };

  return (
    <>
      <LogOut className='absolute text-white top-28 right-60 cursor-pointer translate-x-3/4 xs:right-12 transition-all duration-200 hover:scale-125' onClick={redirect} />
      <div className='absolute font-extrabold text-4xl flex flex-col items-center justify-center top-16 w-80 h-3/5 mt-12'>
        <p className='text-white'>{user.username}</p>
        <p className='text-white mt-6 mb-12'>{user.points} points</p>
        <img src={user.pfp} alt="Profile Picture" className='rounded-full w-52 h-52 xs:w-40 xs:h-40' />

        <div className='mt-10'>
          <CustomButton onClick={() => setIsProfileModalOpen(true)} value={'Modify Profile'} />
        </div>

        <div>
          <p className='text-white'>Your Malus:</p>
          {myMalus === null ? (
            <Loader className='size-6 animate-spin mx-auto' />
          ) : myMalus.length === 0 ? (
            <p className='text-white font-semibold text-xl'>No Malus assigned yet</p>
          ) : (
            myMalus.map((malus, index) => <img key={index} src={malus.pfp} className='rounded-full' />)
          )}
          <CustomButton onClick={() => setIsMalusModalOpen(true)} value={'Change Malus'} />
        </div>

        <MalusModal isOpen={isMalusModalOpen} onClose={() => setIsMalusModalOpen(false)} handleSave={handleSaveMalus} user={user} getUserPfp={getUserPfp} />
        <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} handleSave={handleSaveProfile} />
      </div>
    </>
  );
};

export default Profile;
