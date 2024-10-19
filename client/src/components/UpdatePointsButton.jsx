/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Loader } from "lucide-react";
import { useUser } from '../assets/UserContext';

const UpdatePointsButton = () => {
  const { user, setUser } = useUser(); // Destructure setUser from useUser
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

  const handleUpdatePoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/update-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(data.message);
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error updating points: ', err);
      setError('Failed to update points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleUpdatePoints}
        className={`bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-4 py-2 rounded-xl text-lg font-medium w-40 h-16 mb-52
          hover:from-indigo-800 hover:to-indigo-950 shadow-custom 
          xs:w-40 xs:font-normal xs:mr-0`}
        disabled={loading}
      >
        {loading ? <Loader className='size-6 animate-spin mx-auto' /> : 'Update Points'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}
    </div>
  );
};

export default UpdatePointsButton;
