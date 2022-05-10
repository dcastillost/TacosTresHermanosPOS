import React from 'react';
import { Link } from 'react-router-dom';
import GoogleAuth from './GoogleAuth';

export default function Header() {
  return (
    <div className='ui secondary pointing menu'>
      <div className='right menu'>
        <Link to='/food' className='item'>
          Food menu
        </Link>
        <Link to='/goods' className='item'>
          Goods
        </Link>
        <Link to='/about-us' className='item'>
          About us
        </Link>
        <Link to='/become-a-hermano' className='item'>
          Become a hermano
        </Link>
        <GoogleAuth />
      </div>
    </div>
  );
}