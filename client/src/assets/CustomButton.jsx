import React, { useEffect, useState } from "react";

const CustomButton = ({ value, onClick, margin }) => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const handleTouch = () => setIsTouch(true);
    window.addEventListener("touchstart", handleTouch);
    
    return () => window.removeEventListener("touchstart", handleTouch);
  }, []);

  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-4 py-2 rounded-xl text-lg font-medium w-40 h-16 shadow-custom
        transition-all duration-200 xs:scale-90 ${margin}
        ${!isTouch ? "hover:from-indigo-800 hover:to-indigo-950 hover:scale-110" : ""}`}
    >
      {value}
    </button>
  );
};

export default CustomButton;
