/* eslint-disable no-unused-vars */
import React from 'react';

const Option = ({ label, isActive, redirectToPage, icon: Icon }) => {
  return (
    <button
      className={`option font-normal w-24 h-24 rounded-full p-4 m-2 text-white flex flex-col items-center justify-center transition-all shadow-custom ${isActive ? 'bg-violet-900' : ''}
      hover:bg-violet-900 hover:scale-125 xs:hover:normal-case xs:w-14 xs:h-14 xs:text-xs xs:m-0 xs:p-0`}
      onClick={redirectToPage}
    >
      <Icon className='xs:translate-y-2 xs:h-9'/>
      <div className='xs:text-transparent'>{label}</div>
    </button>
  );
};

export default Option;
