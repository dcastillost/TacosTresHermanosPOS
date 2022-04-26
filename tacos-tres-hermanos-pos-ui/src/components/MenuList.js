import React, { useState } from 'react';
import MenuItem from './MenuItem';
import './MenuList.css';


//Refactor to have only one item on props and do the destructuring directly on MenuItem
const MenuList = (props) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const onTitleClick = (index) => {
    setActiveIndex(index);
  };
  
  const menuItems = props.menuItems.map(({ description, alt_description, id, urls, color, height }) => {
    return (
      // <div className='menu-list' key={id}>
      <MenuItem
        key={id}
        menuItemName={color}
        menuItemDescription={description}
        menuItemPrice={height}
        menuItemImageURL={urls.regular}
        menuItemImageDescription={alt_description}
        menuItemSlug={urls.regular}
      />
      // </div>
    );
  });

  return (
    <div>{menuItems}</div>
  );
};

export default MenuList;
