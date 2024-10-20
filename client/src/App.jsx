/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Formation from './components/Formation';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import Home from './components/Home';
import { UserProvider } from './assets/UserContext';
import FloatingShapes from './assets/FloatingShapes';
import Search from './components/Search';
import Users from './components/Users';
import EmailVerificationPage from './components/EmailVerificationPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  }

  const handleSignup = () => {
    setIsAuthenticated(true);
  }

  const redirectToLogin = () => {
    setIsAuthenticated(false);
  };

  return (
    <UserProvider>
      <Router>
        <div className='relative w-full h-full text-center flex justify-center items-center flex-col overflow-hidden
        bg-gradient-to-br from-indigo-950 via-violet-950 to-violet-900'>
          <FloatingShapes color="bg-indigo-700" size="w-64 h-64" top="-5%" left="10%" delay={0}/>
          <FloatingShapes color="bg-indigo-700" size="w-48 h-48" top="70%" left="80%" delay={5}/>
          <FloatingShapes color="bg-indigo-700" size="w-32 h-32" top="40%" left="-10%" delay={2}/>
          {!isAuthenticated ? (
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/email-verification" element={<EmailVerificationPage onSignup={handleSignup}/>} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<Login onLogin={handleLogin} />} />
            </Routes>
          ) : (
            <>
              <Navbar />
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/search" element={<Search className='fixed top-20 w-[450px] xs:w-64'/>} />
                <Route path="/formation" element={<Formation />} />
                <Route path="/profile" element={<Profile redirectToLogin={redirectToLogin}/>} />
                <Route path="/profile/:username" element={<Users />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </>
          )}
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
