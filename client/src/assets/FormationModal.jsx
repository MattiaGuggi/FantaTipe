/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useUser } from './UserContext';
import Search from '../components/Search';

const FormationModal = ({ isOpen, onClose, handleSave, getUserPfp }) => {
    const { user } = useUser();
    const [formationInput, setFormationInput] = useState('');
    const [formationData, setFormationData] = useState([]);
    const [pfps, setPfps] = useState({}); // State to store profile pictures

    useEffect(() => {
        if (isOpen) {
            const getFormation = async () => {
                try {
                    const response = await fetch(`http://localhost:8080/get-formation/${user.username}`);
                    const data = await response.json();
                    if (response.ok) {
                        setFormationData(data.formation || []);
                    } else {
                        console.error('Error fetching formation:', data.message);
                    }
                } catch (error) {
                    console.error('Error fetching formation:', error);
                }
            };
            getFormation();
        }
    }, [isOpen, user.username]);

    // Fetch profile pictures for formation members
    useEffect(() => {
        const fetchPfps = async () => {
            const updatedPfps = {};
            for (const member of formationData) {
                const pfp = await getUserPfp(member);
                updatedPfps[member] = pfp;
            }
            setPfps(updatedPfps); // Set fetched profile pictures
        };

        if (formationData.length > 0) {
            fetchPfps();
        }
    }, [formationData, getUserPfp]);

    if (!isOpen) return null;
    
    const handleAddFormation = (value) => {
        if (value.trim()) {
            const existingUser = formationData.find((user) => user.toLowerCase() === value.toLowerCase()); // Checks if a users puts a persone in his formation more than once
            if (existingUser)
                return alert('User already in formation!');
            if (formationData.length >= 7)
                return alert('Cannot add more than 7 people to formation!');
            setFormationData((prev) => [...prev, value.trim()]);
            setFormationInput(''); // Clear input after adding
        }
    };

    const handleDelete = (index) => {
        const updatedFormations = formationData.filter((_, i) => i !== index);
        setFormationData(updatedFormations);
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-1/4 h-2/3 flex flex-col items-center justify-between xs:w-10/12 xs:min-h-5/6 xs:h-auto'>
                <div className='w-full flex flex-col'>
                    <h2 className='text-2xl mb-4 text-center w-full xs:mt-4'>Modify Formation</h2>
                    <Search className='relative top-0 w-full' mode='formation' addToFormation={handleAddFormation} />
                </div>
                <div className='mt-6 text-2xl flex flex-wrap'>
                    {formationData.length > 0 ? (
                        formationData.map((item, index) => (
                            <div key={index} onClick={() => handleDelete(index)} className='relative m-1 cursor-pointer h-24 w-24'>
                                <img
                                    className='rounded-full h-full w-full object-cover'
                                    src={pfps[item] || ''} // Use the fetched profile picture or a default
                                    alt={item}
                                />
                                <div className='absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 transition-opacity duration-300 hover:opacity-100'></div>
                            </div>
                        ))
                    ) : (
                        <p>No formation found</p>
                    )}
                </div>
                <div className='flex justify-evenly w-full xs:h-10 xs:w-11/12 xs:mt-10'>
                    <button onClick={onClose} className='bg-gradient-to-r from-indigo-700 to-indigo-900 text-transparent bg-clip-text px-4 py-2 rounded-xl shadow-custom text-lg font-medium w-32 hover:bg-gray-500 hover:text-transparent hover:bg-clip-text hover:from-indigo-800 hover:to-indigo-950 xs:w-28 xs:font-normal xs:ml-0'>
                        Cancel
                    </button>
                    <button onClick={() => handleSave({ formation: formationData })} className='bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-4 py-2 rounded-xl text-lg font-medium w-32 hover:from-indigo-800 hover:to-indigo-950 shadow-custom xs:w-28 xs:font-normal xs:mr-0'>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormationModal;
