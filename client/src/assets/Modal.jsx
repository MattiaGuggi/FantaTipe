/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { User, Lock, Mail } from "lucide-react";
import Input from './Input';

const Modal = ({ isOpen, onClose, user, handleSave }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = React.useState({
    username: user.username,
    email: user.email,
    password: user.password,
    pfp: user.pfp,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openFiles = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          pfp: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fileInputRef = React.useRef(null); // Reference to the hidden file input

  const handleFileButtonClick = () => {
    fileInputRef.current.click(); // Trigger the hidden file input click
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white p-6 rounded-lg shadow-lg w-1/4 h-3/4 flex flex-col items-center xs:w-10/12 xs:h-5/6 sm:w-2/3 sm:h-3/4 md:w-2/4 md:h-3/4 xl:h-3/4'>
        <h2 className='text-2xl mb-4 text-center w-full xs:mt-4'>Modify Profile</h2>
        <div className='w-full flex flex-col'>
          <label className='text-lg font-bold mb-1 text-left xs:mt-1'>Username</label>
          <Input
            icon={User}
            type='text'
            name='username'
            styles={'text-base font-medium'}
            value={formData.username || ''}
            onChange={handleChange}
          />
          <label className='text-lg font-bold mb-1 mt-6 text-left xs:mt-3'>Email</label>
          <Input
            icon={Mail}
            type='email'
            name='email'
            styles={'text-base font-medium'}
            value={formData.email || ''}
            onChange={handleChange}
          />
          <label className='text-lg font-bold mb-1 mt-6 text-left xs:mt-3'>Password</label>
          <Input
            icon={Lock}
            type='password'
            name='password'
            styles={'text-base font-medium'}
            value={formData.password || ''}
            onChange={handleChange}
          />
        </div>
        <div className='flex justify-between items-center w-full mt-10 xs:mt-10'>
          <img src={formData.pfp} alt='Profile' className='w-32 h-32 object-cover rounded-full xs:w-20 xs:h-20'/>
          <div className='flex flex-col flex-wrap break-words justify-center items-center'>
            <input
              type='file'
              accept='image/*'
              ref={fileInputRef}
              onChange={openFiles}
              className='hidden'
            />
            <button
              onClick={handleFileButtonClick}
              className='text-lg font-medium bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-xl shadow
              hover:from-indigo-800 hover:to-indigo-950 min-h-12 h-auto flex flex-wrap break-words m-4 px-4 py-2
              xs:text-base xs:w-auto xs:min-h-8 xs:font-normal xs:ml-0 xs:mr-0 xs:mt-2 xs:h-12 xs:text-center'
            >
              Change Image
            </button>
          </div>
        </div>
        <div className='flex justify-evenly w-full mt-10 gap-8 h-12 xs:h-10 xs:w-11/12 xs:mt-10'>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-transparent bg-clip-text px-4 py-2 rounded-xl shadow-custom text-lg font-medium w-36
            hover:bg-gray-500 hover:text-transparent hover:bg-clip-text hover:from-indigo-800 hover:to-indigo-950
            xs:w-28 xs:font-normal xs:ml-0"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(formData)}
            className='bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-4 py-2 rounded-xl text-lg font-medium w-36
            hover:from-indigo-800 hover:to-indigo-950 shadow-custom
            xs:w-28 xs:font-normal xs:mr-0'
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
