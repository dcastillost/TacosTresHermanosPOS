const MenuItem = require('../../database/menuItem');

const getAllMenuItems = async (filterParams) => {
  //Do data transformation here
  try {
    const allMenuItems = await MenuItem.getAllMenuItems(filterParams);
    return allMenuItems;
  } catch (error) {
    throw error;
  }
};

const getOneMenuItem = async (menuItemName) => {
  try {
    const menuItem = await MenuItem.getOneMenuItem(menuItemName);
    return menuItem;
  } catch (error) {
    throw error;
  }
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
  try {
    const updatedMenuItem = await MenuItem.updateOneMenuItem(menuItemName, updates);
    return updatedMenuItem;
  } catch (error) {
    throw error;
  }
};

const deleteOneMenuItem = async (menuItemName) => {
  try {
    const deletedCount = await MenuItem.deleteOneMenuItem(menuItemName);
    return deletedCount;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllMenuItems,
  getOneMenuItem,
  createNewMenuItem,
  updateOneMenuItem,
  deleteOneMenuItem
}