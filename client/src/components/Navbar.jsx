/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Option from '../assets/Option';
import { User, Home, Search, Layers, Gamepad2 } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [activeOption, setActiveOption] = useState('Home');

  const redirectToPage = (page) => {
    setActiveOption(page);
    navigate(`/${page.toLowerCase()}`);
  };

  return (
    <div className='fixed w-9/12 flex justify-around p-4 items-start bottom-4 bg-white backdrop-filter backdrop-blur-md bg-opacity-10 rounded-full shadow-custom
      transition-transform xs:w-11/12 xs:h-18 xs:rounded-3xl'
      >
      <Option
        label="Home"
        isActive={activeOption === 'Home'}
        redirectToPage={() => redirectToPage('Home')}
        icon={Home}
      />
      <Option
        label="Search"
        isActive={activeOption === 'Search'}
        redirectToPage={() => redirectToPage('Search')}
        icon={Search}
      />
      <Option
        label="Games"
        isActive={activeOption === 'Games'}
        redirectToPage={() => redirectToPage('Games')}
        icon={Gamepad2}
      />
      <Option
        label="Formation"
        isActive={activeOption === 'Formation'}
        redirectToPage={() => redirectToPage('Formation')}
        icon={Layers}
      />
      <Option
        label="Profile"
        isActive={activeOption === 'Profile'}
        redirectToPage={() => redirectToPage('Profile')}
        icon={User}
      />
    </div>
  );
};

export default Navbar;
