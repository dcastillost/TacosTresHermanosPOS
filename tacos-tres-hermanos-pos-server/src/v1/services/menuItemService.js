const MenuItem = require('../../database/menuItem');


const getAllMenuItems = async () => {
  const allMenuItems = await MenuItem.getAllMenuItems();
  return allMenuItems;
};

const getOneMenuItem = () => {
  return;
};

const createNewMenuItem = () => {
  return;
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