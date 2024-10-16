/* eslint-disable no-unused-vars */
import React from 'react';
import { updatePoints } from '../../../server/points/updatePoints.js';

const UpdatePointsButton = () => {
  const handleUpdatePoints = async () => {
    try {
      await updatePoints();
    } catch (err) {
      console.error('Error updating points: ', err);
    }
  };
  
  return (
    <button
      onClick={handleUpdatePoints}
      className='bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-4 py-2 rounded-xl text-lg font-medium w-40 h-16
      hover:from-indigo-800 hover:to-indigo-950 shadow-custom
      xs:w-28 xs:font-normal xs:mr-0'
    >
      Update Points
    </button>
  );
}

export default UpdatePointsButton;
