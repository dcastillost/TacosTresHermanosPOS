const { body, validationResult } = require('express-validator');
const menuItemService = require('../services/menuItemService');

const getAllMenuItems = async (req, res) => {
  const allMenuItems = await menuItemService.getAllMenuItems();
  res.json({ status: "OK", data: allMenuItems });
};

//For now only handles queries by item name
const getOneMenuItem = async (req, res) => {
  console.log(req);
  const {
    params: { menuItemName },
  } = req;
  if (!menuItemName) {
    res.status(500).json({ message: 'No menu item name was provided' });
    return;
  }
  const menuItem = await menuItemService.getOneMenuItem(menuItemName);
  res.send({ status: "OK", data: menuItem });
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
    res
      .status(400)
      .json({
        status: 'FAILED',
        data: {
          error: "One of the following keys is missing or is empty: 'name', 'price', 'shortDescription', 'longDescription', 'imageURL', 'units', 'category', 'options', 'availability'"
        }
      });
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

  try {
    const createdMenuItem = await menuItemService.createNewMenuItem(newMenuItem);
    res.status(201).json({ status: "OK", data: createdMenuItem });
  } catch (error) {
    res
      .status(error?.status || 500)
      .json({ status: "FAILED", data: { error: error?.message || error } });
  }
};

const updateOneMenuItem = async (req, res) => {
  const {
    body,
    params: { menuItemName },
  } = req;
  console.log(body);
  if (!menuItemName) return;
  const updatedMenuItem = await menuItemService.updateOneMenuItem(menuItemName, body);
  res.json({ status: "OK", data: updatedMenuItem });
};

const deleteOneMenuItem = async (req, res) => {
  const {
    params: { menuItemName },
  } = req;
  if (!menuItemName) return;
  const deletedCount = await menuItemService.deleteOneMenuItem(menuItemName);
  res.status(204).send({ status: "OK" });
};

module.exports = {
  getAllMenuItems,
  getOneMenuItem,
  createNewMenuItem,
  updateOneMenuItem,
  deleteOneMenuItem
};