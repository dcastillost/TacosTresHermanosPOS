const orderService = require('../services/orderService');

const getAllOrders = (req, res) => {
  const allOrders = orderService.getAllOrders();
  console.log(allOrders);
  res.send("Get all orders");
};

const getOneOrder = (req, res) => {
  res.send("Get one order");
};

const createNewOrder = (req, res) => {
  res.send("Create new order");
};

const updateOneOrder = (req, res) => {
  res.send("Update one order");
};

const deleteOneOrder = (req, res) => {
  res.send("Delete one order");
};

module.exports = {
  getAllOrders,
  getOneOrder,
  createNewOrder,
  updateOneOrder,
  deleteOneOrder
};