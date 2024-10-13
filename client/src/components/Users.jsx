/* eslint-disable react-hooks/exhaustive-deps */
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Users = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

    useEffect(() => {
        fetch(`${API_URL}/profile/${username}`)
            .then(response => response.json())
            .then(data => setProfile(data.user))
            .catch(err => console.log("Error loading profile", err));
    }, [username]);

    return (
        <div className='absolute flex flex-col top-12'>
            {profile ? (
                <div className='border-2 border-gray-600 rounded-3xl p-40 bg-white backdrop-filter backdrop-blur-md bg-opacity-10 flex flex-col items-center
                hover:cursor-pointer hover:bg-indigo-500 hover:bg-opacity-10 xs:py-28 xs:px-16 xs:mt-8'>
                    <h1 className='text-6xl xs:text-5xl'>{profile.username}</h1>
                    <p className='text-4xl mt-5'>Points: {profile.points}</p>
                    <img src={profile.pfp} alt={`${profile.username}'s profile picture`} className='w-48 h-48 mt-12 rounded-full xs:w-40 xs:h-40 xs:mt-8' />
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Users;
