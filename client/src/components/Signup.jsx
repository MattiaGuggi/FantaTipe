/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../assets/Input';
import { useUser } from '../assets/UserContext';
import axios from 'axios';
import PasswordStrengthMeter from '../assets/PasswordStrengthMeter';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/signup`,
        { email: email, password: password, username: name },
        { withCredentials: true, }
      );

      if (response.data.success) {
        const { email, username, points, password, pfp } = response.data.user;
        setUser({ email, username, points, password, pfp });
        navigate('/email-verification', { state: { email }});
      }
      else
        setErrorMessage(response.data.message);

    } catch (error) {
      console.error('There was an error!', error);
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  const redirectToPage = (page) => {
    navigate(`/${page.toLowerCase()}`);
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-500 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden xs:w-11/12"
    >
    <div className="p-8">
      <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-700 to-indigo-950 text-transparent bg-clip-text'>
				Create Account
			</h2>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <form onSubmit={handleSignUp}>
            <Input icon={User} type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} />
            <Input icon={Mail} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input icon={Lock} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <PasswordStrengthMeter password={password} />
            <motion.button
              className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
            >
            Sign Up
            </motion.button>
        </form>
        </div>
      <div className="px-8 py-4 bg-gray-600 bg-opacity-50 flex justify-center rounded-2xl">
        <p className="text-sm text-indigo-950">
          {"Already have an account?"}
          <button onClick={() => redirectToPage('Login')} className="text-bg-indigo-700 hover:underline" type="button">
            Login
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default Signup;
