import React from 'react';

/*
Menu item component.
Used to display each individual menu item's information
Takes the item information as props including the item's name, description and image.
*/

//Refactor: Use grid system for layout
class MenuItem extends React.Component {
  // const {description, alt_description, id, urls, color, height} = this.props.menuItemInfo;
  render() {
    return(
      <div>
        <h1>{this.props.menuItemName}</h1>
        <body>
          <div>{this.props.menuItemDescription}</div>
          <div><b>{this.props.menuItemPrice}</b></div>
          <img src={this.props.menuItemImageURL} alt={this.props.menuItemImageDescription}/>
        </body>
      </div>
    );
  }
}

export default MenuItem;