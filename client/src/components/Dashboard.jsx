/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [users, setUsers] = useState([]);
    const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
    const navigate = useNavigate();

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
            <style>{`
                .scroll-container::-webkit-scrollbar {
                    width: 0px;
                }
                
                .scroll-container::-webkit-scrollbar-thumb {
                    background-color: rgb(203 213 225 / 1);
                    border-radius: 5px;
                }
                
                .scroll-container::-webkit-scrollbar-track {
                    background-color: transparent;
                }
            `}</style>

            <h1 className='font-bold text-center text-5xl text-white'>Leaderboard</h1>
            <div className='bg-slate-100 text-black font-medium w-9/12 h-auto m-10 mb-2 p-5 rounded-xl'>
                <div className='scroll-container max-h-96 overflow-y-auto overflow-x-hidden'>
                    {users.length > 0 ? (
                        users.map((user, index) => (
                            <div key={index} className='w-full h-16 flex items-center justify-between m-2 rounded-xl cursor-pointer transition-all duration-300 bg-slate-100
                                hover:bg-slate-300 hover:text-2xl hover:font-bold hover:shadow-custom'
                                onClick={() => redirectToPage(user.username)}
                            >
                                <div className='flex w-full items-center'>
                                    <p className='p-4'>{index + 1}</p>
                                    <p className='p-4 flex-grow'>{user.username}</p>
                                    <p className='p-4 ml-auto'>{user.points}pt</p>
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
