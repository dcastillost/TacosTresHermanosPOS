import React from 'react';

/*
Menu item component.
Used to display each individual menu item's information
Takes the item information as props including the item's name, description and image.
*/

//Refactor: Use grid system for layout
const MenuItem = (props) => {
  // const {description, alt_description, id, urls, color, height} = this.props.menuItemInfo;
  return (
    <div className='menu-list item'>
      <div className='content'>
        <div className='header'>{props.menuItemName}</div>
        <span>
          <div>{props.menuItemDescription}</div>
          <div><b>{props.menuItemPrice}</b></div>
          <img src={props.menuItemImageURL} alt={props.menuItemImageDescription} />
        </span>
      </div>
      <div className='right floated content'>
        <a 
          className='ui button'
          href={`https://www.tacos3hermanos.com/menu/${props.menuItemSlug}`}
        >
          Go
        </a>
      </div>
    </div>
  );
};

export default MenuItem;