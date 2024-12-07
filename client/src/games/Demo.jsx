import { useNavigate } from 'react-router-dom';

const Demo = () => {
  const navigate = useNavigate();

  const room = (status) => {
    if (status === "create") {
      navigate("/create-room");
    }
    else if (status === "join") {
      // Check if the user has a stored room key and participant name
      const storedRoomKey = localStorage.getItem("roomKey");

      // Automatically join the room if the key exists
      if (storedRoomKey) {
        navigate(`/${storedRoomKey}`);
      }
      else {
        navigate("/join-room");
      }
    }
  };

  return (
    <>
      <div className='text-white font-bold text-3xl mb-12'>Demo</div>
      <div className='flex'>
        <div className='flex items-center justify-center cursor-pointer py-5 px-8 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white m-4
            font-bold rounded-2xl shadow-lg hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2
          focus:ring-offset-gray-900 transition-all duration-200 hover:scale-110'
          onClick={() => room("create")}>
            Create Room
        </div>
        <div className='flex items-center justify-center cursor-pointer py-5 px-8 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white m-4
            font-bold rounded-2xl shadow-lg hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2
            focus:ring-offset-gray-900 transition-all duration-200 hover:scale-110'
          onClick={() => room("join")}>
            Join Room
        </div>
      </div>
    </>
  )
};

export default Demo;