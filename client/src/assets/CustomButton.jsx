import React from 'react';

const CustomButton = ({ value: value, onClick: onClick, margin: margin }) => {
    return (
        <button onClick={onClick} className={`bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-4 py-2 rounded-xl text-lg font-medium w-40 h-16
            hover:from-indigo-800 hover:to-indigo-950 shadow-custom hover:scale-110 transition-all duration-200
            xs:w-40 xs:font-normal xs:mr-0 xs:mb-32 ${margin}`}
        >
            {value}
        </button>
    )
}

export default CustomButton;
