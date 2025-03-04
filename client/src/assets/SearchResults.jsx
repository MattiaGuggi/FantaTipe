/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SearchResults = ({ results, mode, addToFormation, addToMalus }) => {
    const navigate = useNavigate();

    const showProfile = (value) =>  {
        navigate(`/profile/${value}`);
    };

    const handleResultClick = (value) => {
        if (mode === 'search') {
          showProfile(value);
        }
        else if (mode === 'formation') {
          addToFormation(value);
        }
        else if (mode == 'malus') {
            addToMalus(value);
        }
    };

    return (
        <>
            <style>{`
                .result::-webkit-scrollbar {
                    width: 0px;
                }
                
                .result::-webkit-scrollbar-thumb {
                    background-color: rgb(203 213 225 / 1);
                    border-radius: 5px;
                }
                
                .result::-webkit-scrollbar-track {
                    background-color: transparent;
                }
            `}</style>
            <div className='result w-full bg-[#2f3134] flex flex-col shadow-lg rounded-lg mt-4 max-h[300px] overflow-y-scroll
            scrollbar-thumb-slate-400 scrollbar-trace-slate-600 xs:mt-2'>
                {
                    results.map((result, idx) => {
                        return (
                            <div key={idx}>
                                <p className='w-full text-white text-lg cursor-pointer py-3 hover:bg-white hover:backdrop-filter hover:backdrop-blur-md hover:bg-opacity-10'
                                    onClick={() => handleResultClick(result)}
                                >
                                    {result}
                                </p>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default SearchResults;
