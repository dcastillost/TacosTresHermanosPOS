const menuItemService = require('../services/menuItemService');

const getAllMenuItems = (req, res) => {
  const allMenuItems = menuItemService.getAllMenuItems();
  res.send('Get all menu items');
};

const getOneMenuItem = (req, res) => {
  const menuItem = menuItemService.getOneMenuItem();
  res.send('Get an existing menu item');
};

const createNewMenuItem = (req, res) => {
  const createdMenuItem = menuItemService.createNewMenuItem();
  res.send('Create new menu item');
};

const updateOneMenuItem = (req, res) => {
  const updatedMenuItem = menuItemService.updateOneMenuItem();
  res.send('Update existing menu item');
};

const deleteOneMenuItem = (req, res) => {
  menuItemService.deleteOneMenuItem();
  res.send('Delete an existing menu item');
};

module.exports = {
  getAllMenuItems,
  getOneMenuItem,
  createNewMenuItem,
  updateOneMenuItem,
  deleteOneMenuItem
};