/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useUser } from '../assets/UserContext';
import FormationModal from '../assets/FormationModal';
import { Loader } from 'lucide-react';
import CustomButton from '../assets/CustomButton';

const Formation = () => {
  const { user, setUser } = useUser();
  const [formation, setFormation] = useState([]);
  const [pfps, setPfps] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomedImg, setZoomedImg] = useState(null);
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

  useEffect(() => {
    const usersFormation = async () => {
      try {
        const response = await fetch(`${API_URL}/formation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user?.email,
          }),
        });
        const data = await response.json();
  
        if (data.success) setFormation(data.formation);
        else console.error('Error getting user formation: ', data.message);
      } catch (err) {
        console.error('Error getting user formation: ', err);
      }
    };
    if (user) usersFormation();
  }, [user]);

  const getUserPfp = async (username) => {
    if (username === user.username) return user.pfp;
    else {
      try {
        const response = await fetch(`${API_URL}/get-users`);
        const data = await response.json();

        if (response.ok) {
          const foundUser = data.users.find((usr) => usr.username === username);
          return foundUser ? foundUser.pfp : '';
        }
      } catch (err) {
        console.error('Error fetching user pfp: ', err);
      }
    }
    return '';
  };

  useEffect(() => {
    const fetchPfps = async () => {
      const updatedPfps = {};
      for (const username of formation) {
        const pfp = await getUserPfp(username);
        updatedPfps[username] = pfp;
      }
      setPfps(updatedPfps);
    };

    if (formation.length > 0)
      fetchPfps();
  }, [formation]);

  const handleSave = async (newFormation) => {
    const updatedFormation = newFormation.formation;

    try {
      const response = await fetch(`${API_URL}/update-formation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email,
          formation: updatedFormation,
        }),
      });
      const data = await response.json();
        
      if (data.success) {
        setUser(data.user);
        setFormation(data.user.formation);
      }
      else {
        console.error('Failed to save new formation: ', data.message);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving formation: ', err);
    }
  };

  const modifyFormation = () => {
    setIsModalOpen(true);
  };

  const zoom = (username) => {
    setZoomedImg(username);
  };

  const handleOutsideClick = (e) => {
    if (zoomedImg) {
      setZoomedImg(null);
    }
  };
  
  return (
    <div className={`relative ${zoomedImg ? 'overflow-hidden' : ''}`} onClick={handleOutsideClick}>
      {zoomedImg && (
        <div className='zoomed-image flex flex-col justify-center items-center fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md z-50'>
          <h2 className='text-7xl text-white font-semibold mb-10'>{zoomedImg}</h2>
          <img className='rounded-full w-64 h-64' src={pfps[zoomedImg]}/>
        </div>
      )}

      <div className='text-4xl font-bold relative z-10'>
        <h1 className='mb-10 text-white xs:-mt-20'>Your Formation</h1>
        <div className='p-6 flex justify-center items-center w-[660px] flex-wrap z-20 xs:w-full xs:p-2'>
          {formation.length > 0 ? (
            formation.map((username, index) => (
              <img
                key={index}
                className='m-2 rounded-full h-32 w-32 cursor-pointer transition-transform duration-300 xs:w-24 xs:h-24'
                src={pfps[username] || ''}
                alt={username}
                onClick={() => zoom(username)}
              />
            ))
          ) : (
            <Loader className='size-6 animate-spin mx-auto' />
          )}
        </div>
        <div className='relative mt-10 flex items-center justify-center '>
          <CustomButton
            onClick={modifyFormation} value={'Change Formation'} margin={'w-auto'}
          />
        </div>
        <FormationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          handleSave={handleSave}
          getUserPfp={getUserPfp}
        />
      </div>
    </div>
  );
};

export default Formation;
