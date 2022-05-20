const menuItemService = require('../services/menuItemService');

const getAllMenuItems = async (req, res) => {
  const allMenuItems = await menuItemService.getAllMenuItems();
  res.send({ status: "OK", data: allMenuItems });
};

const getOneMenuItem = async (req, res) => {
  const menuItem = await menuItemService.getOneMenuItem();
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