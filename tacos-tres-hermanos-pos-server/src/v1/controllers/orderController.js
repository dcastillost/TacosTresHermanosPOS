const { validationResult } = require('express-validator');
const orderService = require('../services/orderService');

const getAllOrders = async (req, res) => {
  const { status, date } = req.query;
  try {
    const allOrders = await orderService.getAllOrders({ status, date });
    res.json({ status: "OK", data: allOrders });
  } catch (error) {
    catch500Error(error, res);
  }
};

const getOneOrder = async (req, res) => {
  const {
    params: { orderNumber },
  } = req;
  if (!orderNumber) {
    res
      .status(400)
      .send({
        status: "FAILED",
        data: { error: "Parameter 'orderNumber' can not be empty" }
      });
    return;
  }
  try {
    const order = await orderService.getOneOrder(orderNumber);
    res.send({ status: "OK", data: order });
  } catch (error) {
    catch500Error(error, res);
  }
};

const createNewOrder = async (req, res) => {
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

    const newOrder = {
      items: body.items,
      paymentMethod: body.paymentMethod,
    };

    const createdOrder = await orderService.createNewOrder(newOrder);
    res.status(201).json({ status: "OK", data: createdOrder });
  } catch (error) {
    catch500Error(error, res);
  }
};

const updateOneOrder = async (req, res) => {
  const {
    body,
    params: { orderNumber },
  } = req;
  if (!orderNumber) {
    res
      .status(400)
      .send({ status: "FAILED", data: { error: "Parameter 'orderNumber' can not be empty" } });
    return;
  }
  try {
    const updatedOrder = await orderService.updateOneOrder(orderNumber, body);
    res.send({ status: "OK", data: updatedOrder });
  } catch (error) {
    catch500Error(error, res);
  }
};

const deleteOneOrder = async (req, res) => {
  const {
    params: { orderNumber },
  } = req;
  if (!orderNumber) {
    res
      .status(400)
      .send({ status: "FAILED", data: { error: "Parameter 'orderNumber' can not be empty" } });
    return;
  }
  try {
    const deletedCount = await orderService.deleteOneOrder(orderNumber);
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
  getAllOrders,
  getOneOrder,
  createNewOrder,
  updateOneOrder,
  deleteOneOrder
};
