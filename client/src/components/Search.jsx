/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import SearchBar from '../assets/SearchBar';
import SearchResults from '../assets/SearchResults';


const Search = ({ className, mode = 'search', addToFormation, addToMalus }) => {
  const [result, setResult] = useState([]);

  return (
    <div className={`search ${className}`}>
      <SearchBar setResult={setResult} />
      <SearchResults results={result} mode={mode} addToFormation={addToFormation} addToMalus={addToMalus}/>
    </div>
  )
}


export default Search;
