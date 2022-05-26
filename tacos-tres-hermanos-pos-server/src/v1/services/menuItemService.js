const MenuItem = require('../../database/menuItem');

const getAllMenuItems = async () => {
  //Do data transformation here
  const allMenuItems = await MenuItem.getAllMenuItems();
  return allMenuItems;
};

const getOneMenuItem = async (menuItemName) => {
  const menuItem = await MenuItem.getOneMenuItem(menuItemName);
  return menuItem;
};

const createNewMenuItem = async (newMenuItem) => {
  const menuItemToInsert = {
    ...newMenuItem,
    // id insertion is handled by MongoDB
    createdAt: new Date().toLocaleString('en-US', { timeZone: 'UTC' }),
    updatedAt: new Date().toLocaleString('en-US', { timeZone: 'UTC' })
  };
  try {
    const createdMenuItem = await MenuItem.createNewMenuItem(menuItemToInsert);
    return createdMenuItem;
  } catch (error) {
    throw error;
  }
};

const updateOneMenuItem = async (menuItemName, body) => {
  updates = {
    ...body,
    updatedAt: new Date().toLocaleString('en-US', { timeZone: 'UTC' })
  };
  const updatedMenuItem = await MenuItem.updateOneMenuItem(menuItemName, updates);
  return updatedMenuItem;
};

const deleteOneMenuItem = async (menuItemName) => {
  const deletedCount = await MenuItem.deleteOneMenuItem(menuItemName);
  return deletedCount;
};

module.exports = {
  getAllMenuItems,
  getOneMenuItem,
  createNewMenuItem,
  updateOneMenuItem,
  deleteOneMenuItem
}