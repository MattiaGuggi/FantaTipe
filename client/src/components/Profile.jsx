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
  const [pfps, setPfps] = useState({});
  const navigate = useNavigate();
  const [zoomedImg, setZoomedImg] = useState(null);
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
    if (pfps[username]) return pfps[username]; // Return cached PFP if already fetched
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
        const response = await axios.post(`${API_URL}/update-my-malus`, { email: user.email, myMalus: updatedMalus });

        const data = await response.data;
        console.log(data);
        
        if (data.success) {
            setMyMalus(updatedMalus);
        } else {
            console.error('Failed to save new malus: ', data.message);
        }
        setIsMalusModalOpen(false); // Close the modal
    } catch (err) {
        console.error('Error saving malus:', err);
    }
  };

  const redirect = () => {
    redirectToLogin();
    navigate('/login');
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
    <>
      <LogOut className='absolute text-white top-28 right-60 cursor-pointer translate-x-3/4 xs:right-12 transition-all duration-200 hover:scale-125' onClick={redirect} />
      <div className={`absolute font-extrabold text-4xl flex flex-col items-center justify-center top-16 w-80 h-3/5 mt-12 ${zoomedImg ? 'overflow-hidden' : ''}`}
        onClick={handleOutsideClick}>
        {zoomedImg && (
          <div className='zoomed-image flex flex-col justify-center items-center fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md z-50'>
            <h2 className='text-7xl text-white font-semibold mb-10'>{zoomedImg}</h2>
            <img className='rounded-full w-52 h-52' src={pfps[zoomedImg]}/>
          </div>
        )}
        <p className='text-white'>{user.username}</p>
        <p className='text-white mt-6 mb-12'>{user.points} points</p>
        <img src={user.pfp} alt="Profile Picture" className='rounded-full w-48 h-48 xs:w-40 xs:h-40' />

        <div className='mt-10'>
          <CustomButton onClick={() => setIsProfileModalOpen(true)} value={'Modify Profile'} />
        </div>

        <div className=''>
          <p className='text-white'>Your Malus:</p>
          <div className='flex gap-5 m-5'>
            {myMalus === null ? (
              <Loader className='size-6 animate-spin mx-auto' />
            ) : myMalus.length === 0 ? (
              <p className='text-white font-semibold text-xl'>No Malus assigned yet</p>
            ) : (
              myMalus.map((username, index) => <img key={index} src={pfps[username]} className='rounded-full w-24 h-24 cursor-pointer xs:w-20 xs:h-20' onClick={() => zoom(username)} />)
            )}
          </div>
          <CustomButton onClick={() => setIsMalusModalOpen(true)} value={'Change Malus'} />
        </div>

        <MalusModal isOpen={isMalusModalOpen} onClose={() => setIsMalusModalOpen(false)} handleSave={handleSaveMalus} user={user} getUserPfp={getUserPfp} />
        <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} handleSave={handleSaveProfile} />
      </div>
    </>
  );
};

export default Profile;
