/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Games = () => {
    const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";
    const [games, setGames] = useState([]);
    const navigate = useNavigate();
    const redirectToPage = (page) => {
        switch(page) {
            case "Treasure Hunt":
                navigate("/treasure-hunt");
                break;
            case "Virtual Players":
                navigate("/virtual-players");
                break;
            case "Demo":
                navigate("/demo");
                break;
            case "Guess Who":
                navigate("/guess-who");
                break;
            case "Hot Game":
                navigate("/hot-game");
                break;
            default:
                navigate('/home');
                break;
        }
        
    }

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await fetch(`${API_URL}/games`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();

                if (data.success) {
                    setGames(data.games);
                } else {
                    console.error('Error getting games: ', data.message);
                }
            } catch (err) {
                console.error('Error fetching the games', err);
            }
        };

        fetchGames();
    }, []);

    return (
        <>
            <div className="text-white font-bold text-3xl mb-12">Games</div>
            <div className="flex flex-wrap justify-center">
                {games.length > 0 ? (
                    games.map((game, index) => (
                        <div
                            key={index}
                            className='flex items-center justify-center cursor-pointer py-5 px-10 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white m-4
                            font-bold rounded-2xl shadow-lg hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2
                            focus:ring-offset-gray-900 transition duration-200'
                            onClick={() => redirectToPage(game)}
                        >
                            {game}
                        </div>
                    ))
                ) : (
                    <div className="text-red-600 font-bold">No games found</div>
                )}
            </div>
        </>
    );
};

export default Games;
