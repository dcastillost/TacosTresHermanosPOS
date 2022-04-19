import React from 'react';
import MenuItem from './MenuItem';
import './MenuList.css';


//Refactor to have only one item on props and do the destructuring directly on MenuItem
const MenuList = (props) => {
  console.log(props.images);
  const images = props.images.map(({ description, alt_description, id, urls, color, height }) => {
    return (
      <div className='menu-list'>
        <MenuItem
          key={id}
          menuItemName={color}
          menuItemDescription={description}
          menuItemPrice={height}
          menuItemImageURL={urls.regular}
          menuItemImageDescription={alt_description}
        />
      </div>
    );
  });

  return (
    <div>{images}</div>
  );
};

export default MenuList;
