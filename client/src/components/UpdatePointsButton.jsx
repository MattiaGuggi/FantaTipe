/* eslint-disable no-unused-vars */
import React from 'react';
import { updatePoints } from '../../../server/points/handlePoints';

const UpdatePointsButton = () => {
  
  return (
    <button
      onClick={updatePoints}
      className='bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-4 py-2 rounded-xl text-lg font-medium w-40 h-16
      hover:from-indigo-800 hover:to-indigo-950 shadow-custom
      xs:w-28 xs:font-normal xs:mr-0'
    >
      Update Points
    </button>
  )
}

export default UpdatePointsButton;
