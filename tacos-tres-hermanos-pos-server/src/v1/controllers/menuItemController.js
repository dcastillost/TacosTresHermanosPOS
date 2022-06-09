const { validationResult } = require('express-validator');
const menuItemService = require('../services/menuItemService');

const getAllMenuItems = async (req, res) => {
  const { category } = req.query;
  try {
    const allMenuItems = await menuItemService.getAllMenuItems({ category });
    res.json({ status: "OK", data: allMenuItems });
  } catch (error) {
    catch500Error(error, res);
  }
};

//For now only handles queries by item name
const getOneMenuItem = async (req, res) => {
  const {
    params: { menuItemName },
  } = req;
  if (!menuItemName) {
    res
      .status(400)
      .send({
        status: "FAILED",
        data: { error: `Parameter 'menuItemName' can not be empty` }
      });
  }
  try {
    const menuItem = await menuItemService.getOneMenuItem(menuItemName);
    res.send({ status: "OK", data: menuItem });
  } catch (error) {
    catch500Error(error, res);
  }
};

const createNewMenuItem = async (req, res) => {
  try {
    const { body } = req;
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400)
        .json({ 
          status: "FAILED", 
          data: { errors: validationErrors.array().map(error => error.msg) }
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

    const createdMenuItem = await menuItemService.createNewMenuItem(newMenuItem);
    res.status(201).json({ status: "OK", data: createdMenuItem });
  } catch (error) {
    catch500Error(error, res);
  }
};

const updateOneMenuItem = async (req, res) => {
  const {
    body,
    params: { menuItemName },
  } = req;
  if (!menuItemName) {
    res
      .status(400)
      .send({ status: "FAILED", data: "Parameter 'menuItemName' can not be empty" });
  }
  try {
    const updatedMenuItem = await menuItemService.updateOneMenuItem(menuItemName, body);
    res.send({ status: "OK", data: updatedMenuItem });
  } catch (error) {
    catch500Error(error, res);
  }
};

const deleteOneMenuItem = async (req, res) => {
  const {
    params: { menuItemName },
  } = req;
  if (!menuItemName) {
    res
      .status(400)
      .send({ status: "FAILED", data: "Parameter 'menuItemName' can not be empty" });
  }
  try {
    const deletedCount = await menuItemService.deleteOneMenuItem(menuItemName);
    res.status(204).send({ status: "OK" });
  } catch (error) {
    catch500Error(error, res);
  }
};

const catch500Error = (error, res) => {
  res
    .status(error?.status || 500)
    .send({ status: "FAILED", data: { error: error?.message || error } });
};

module.exports = {
  getAllMenuItems,
  getOneMenuItem,
  createNewMenuItem,
  updateOneMenuItem,
  deleteOneMenuItem
};