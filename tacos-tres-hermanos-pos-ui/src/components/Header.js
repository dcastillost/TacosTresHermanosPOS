import React from 'react';
import Link from './Link';

export default function Header() {
  return (
    <div className='ui secondary pointing menu'>
      <Link href='/food' className='item'>
        Food menu
      </Link>
      <Link href='/goods' className='item'>
        Goods
      </Link>
      <Link href='/about-us' className='item'>
        About us
      </Link>
      <Link href='/become-a-hermano' className='item'>
        Become a hermano
      </Link>
    </div>  
  );
}