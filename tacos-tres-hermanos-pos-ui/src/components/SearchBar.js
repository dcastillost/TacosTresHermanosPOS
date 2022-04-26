import React, { useState, useEffect } from 'react';

const SearchBar = (props) => {
  const [term, setTerm] = useState('');

  useEffect(() => {
    console.log('effect used');
  }, [term]);

  const onFormSubmit = (event) => {
    event.preventDefault();
    // console.log(term);
    props.onSubmit(term);
  };

  return (
    <div className='ui segment'>
      <form onSubmit={onFormSubmit} className='ui form'>
        <div className='field'>
          <label>Item search</label>
          <input
            type='text'
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
      </form>
    </div>
  );
};

export default SearchBar;