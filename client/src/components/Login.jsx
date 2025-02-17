/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../assets/Input';
import { useUser } from '../assets/UserContext';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });

      if (response.data.success) {
        const { email, username, points, password, pfp } = response.data.user;
        setUser({ email, username, points, password, pfp });
        onLogin();
        navigate('/home');
      }
      else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error('There was an error!', error);
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password', { state: { email }});
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-500 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden xs:w-11/12">
      <div className="p-8">
        <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-700 to-indigo-950 text-transparent bg-clip-text'>
					Welcome Back
				</h2>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <form onSubmit={handleLogin}>
          <Input icon={Mail} margin={'mb-6'} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input icon={Lock} margin={'mb-6'} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
					<div className='flex items-center mb-6'>
						<div onClick={() => handleForgotPassword()} className='text-sm bg-gradient-to-r from-indigo-950 to-indigo-950 text-transparent bg-clip-text hover:underline cursor-pointer'>
							Forgot password?
						</div>
					</div>
          <motion.button
            className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-indigo-700 to-indigo-950 text-white font-bold rounded-lg shadow-lg hover:from-indigo-800 hover:to-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            >
            Login
          </motion.button>
        </form>
      </div>
      <div className="px-8 py-4 bg-gray-600 bg-opacity-50 flex justify-center">
        <p className="text-sm text-indigo-950">
          {"Don't have an account?"}
          <button onClick={() => handleSignup()} className="text-bg-indigo-700 hover:underline" type="button">
            Sign up
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
