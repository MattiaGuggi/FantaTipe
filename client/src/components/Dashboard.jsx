/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [users, setUsers] = useState([]);
    const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
    const navigate = useNavigate();
    const prova = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/leaderboard`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    const leaderboard = data.leaderboard;
                    setUsers(leaderboard);
                    /* setUsers(prova); */
                }
                else {
                    console.error("No success in the response");
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const redirectToPage = (value) => {
        navigate(`/profile/${value}`);
    };

    return (
        <>
            <h1 className='font-bold text-center text-5xl p-4'>Leaderboard</h1>
            <div className='bg-slate-300 text-black font-medium w-9/12 h-auto m-10 mb-2 p-5 rounded-xl'>
                {/* Scrollable container for leaderboard */}
                <div className='max-h-96 overflow-y-auto overflow-x-hidden'>
                    {users.length > 0 ? (
                        users.map((user, index) => (
                            <div key={index} className='w-full h-16 flex items-center m-2 rounded-xl'
                                onClick={() => redirectToPage(user.username)}>
                                <div className='flex rounded-full cursor-pointer transition-transform duration-300 xs:w-24 xs:h-24'>
                                    <p className='p-4'>{index + 1}</p>
                                    <p className='p-4'>{user.username}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Loader className='size-6 animate-spin mx-auto' /> 
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
