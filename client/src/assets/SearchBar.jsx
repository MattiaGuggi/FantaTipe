/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Input from './Input';

const SearchBar = ({ setResult }) => {
    const [input, setInput] = useState('');
    const [users, setUsers] = useState([]);
    const API_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "";

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_URL}/search`);
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };        

        fetchUsers();
    }, []);

    const userData = (value) => {
        let result = [];

        users.forEach(user => {
            if (user.username.toLowerCase().startsWith(value.toLowerCase()))
                result.push(user.username);
        });
        setResult(result);
    };

    const handleChange = (value) => {
        setInput(value);
        if (value === '') {
            setResult([]);
            return;
        }
        userData(value);
    }

    return (
        <div className='bg-[#2f3134] rounded-lg h-auto w-auto shadow-custom flex items-center xs:h-14'>
            <Input icon={Search} styles={"bg-transparent border-none outline-none text-xl placeholder:text-gray-300 text-white font-medium text-base"}
                type="text" placeholder='Search for users' onChange={(e) => handleChange(e.target.value)}/>
        </div>
    )
}

export default SearchBar;
