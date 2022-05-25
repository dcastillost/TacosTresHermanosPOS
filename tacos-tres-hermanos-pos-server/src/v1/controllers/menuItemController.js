const { body, validationResult } = require('express-validator');
const menuItemService = require('../services/menuItemService');

const getAllMenuItems = async (req, res) => {
  const allMenuItems = await menuItemService.getAllMenuItems();
  res.json({ status: "OK", data: allMenuItems });
};

const getOneMenuItem = async (req, res) => {
  const menuItem = await menuItemService.getOneMenuItem();
  res.send('Get an existing menu item');
};

const createNewMenuItem = async (req, res) => {
  const { body } = req;
  if (
    !body.name ||
    !body.price ||
    !body.shortDescription ||
    !body.longDescription ||
    !body.imageURL ||
    !body.units ||
    !body.category ||
    !body.options ||
    !body.availability
  ) {
    res.status(500).json({ message: 'All fields must be correctly filled.' });
    return;
  }
  
  const newMenuItem = {
    name: body.name,
    price: body.price,
    shortDescription: body.shortDescription,
    longDescription: body.longDescription,
    imageURL: body.imageURL,
    units: body.units,
    category: body.category,
    options: body.options,
    availability: body.availability,
  };

  const createdMenuItem = await menuItemService.createNewMenuItem(newMenuItem);
  res.status(201).json({ status: "OK", data: createdMenuItem });
};

const updateOneMenuItem = async (req, res) => {
  const updatedMenuItem = await menuItemService.updateOneMenuItem();
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