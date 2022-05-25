const MenuItem = require('../../database/menuItem');

const getAllMenuItems = async () => {
  //Do data transformation here
  const allMenuItems = await MenuItem.getAllMenuItems();
  return allMenuItems;
};

const getOneMenuItem = () => {
  return;
};

const createNewMenuItem = async (newMenuItem) => {
  const menuItemToInsert = {
    ...newMenuItem,
    // id insertion is handled by MongoDB
    createdAt: new Date().toLocaleString('en-US', { timeZone: 'UTC' }),
    updatedAt: new Date().toLocaleString('en-US', { timeZone: 'UTC' })
  }
  const createdMenuItem = await MenuItem.createNewMenuItem(menuItemToInsert);
  return createdMenuItem;
};

const updateOneMenuItem = () => {
  return;
};

const deleteOneMenuItem = () => {
  return;
};

module.exports = {
  getAllMenuItems,
  getOneMenuItem,
  createNewMenuItem,
  updateOneMenuItem,
  deleteOneMenuItem
}