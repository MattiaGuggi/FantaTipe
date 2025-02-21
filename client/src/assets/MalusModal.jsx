/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useUser } from './UserContext';
import Search from '../components/Search';
import axios from 'axios';

const MalusModal = ({ isOpen, onClose, handleSave, getUserPfp }) => {
    const { user } = useUser();
    const [malusData, setMalusData] = useState([]);
    const [pfps, setPfps] = useState({}); // State to store profile pictures
    const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
    
    const getMalus = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-my-malus`, { params: { email: user.email } });
            const data = response.data;
            if (data.success) {
                setMalusData(data.myMalus || []);
            }
            else {
                console.error('Error fetching malus:', data.message);
            }
        } catch (error) {
            console.error('Error fetching malus:', error);
        }
    };
    
    const fetchPfps = async () => {
        try {
          const response = await axios.get(`${API_URL}/get-users`);
          if (response.status === 200) {
            const users = response.data.users.reduce((acc, user) => {
              acc[user.username] = user.pfp;
              return acc;
            }, {});
      
            setPfps(users);
          }
        } catch (err) {
          console.error('Error fetching all profile pictures:', err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            getMalus();
        }
    }, [isOpen, user.username]);

    // Fetch profile pictures for formation members
    useEffect(() => {
        if (malusData.length > 0) {
            fetchPfps();
        }
    }, [malusData, getUserPfp]);

    if (!isOpen) return null;
    
    const handleAddMalus = (value) => {
        if (value.trim()) {
            const existingUser = malusData.find((user) => user.toLowerCase() === value.toLowerCase()); // Checks if a users puts a persone in his formation more than once
            if (existingUser)
                return alert('User already in malus!');
            if (malusData.length >= 3)
                return alert('Cannot give malus to more than 3 people!');
            setMalusData((prev) => [...prev, value.trim()]);
        }
    };

    const handleDelete = (index) => {
        const updatedMalus = malusData.filter((_, i) => i !== index);
        setMalusData(updatedMalus);
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-1/4 flex flex-col items-center justify-between h-auto xs:w-10/12 xs:min-h-5/6 xs:h-auto
                sm:w-2/3 md:w-1/2'>
                <div className='w-full flex flex-col'>
                    <h2 className='text-2xl mb-4 text-center w-full xs:mt-4'>Modify Malus</h2>
                    <Search className='relative top-0 w-full' mode='malus' addToMalus={handleAddMalus} />
                </div>
                <div className='mt-6 text-2xl flex flex-wrap'>
                    {malusData.length > 0 ? (
                        malusData.map((item, index) => (
                            <div key={index} onClick={() => handleDelete(index)} className='relative m-1 cursor-pointer h-24 w-24'>
                                <img
                                    className='rounded-full h-full w-full object-cover'
                                    src={pfps[item] || ''}
                                    alt={item}
                                />
                                <div className='absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 transition-opacity duration-300 hover:opacity-100'></div>
                            </div>
                        ))
                    ) : (
                        <p>No malus assigned yet</p>
                    )}
                </div>
                <div className='flex justify-evenly w-full mt-5 xs:h-10 xs:w-11/12 xs:mt-10'>
                    <button onClick={onClose} className='bg-gradient-to-r from-indigo-700 to-indigo-900 text-transparent bg-clip-text px-4 py-2 rounded-xl shadow-custom text-lg font-medium w-32 hover:bg-gray-500 hover:text-transparent hover:bg-clip-text hover:from-indigo-800 hover:to-indigo-950 xs:w-28 xs:font-normal xs:ml-0'>
                        Cancel
                    </button>
                    <button onClick={() => handleSave({ myMalus: malusData })} className='bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-4 py-2 rounded-xl text-lg font-medium w-32 hover:from-indigo-800 hover:to-indigo-950 shadow-custom xs:w-28 xs:font-normal xs:mr-0'>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MalusModal;
