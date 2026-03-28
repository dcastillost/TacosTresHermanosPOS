const Order = require('../../database/order');

const getAllOrders = async (filterParams) => {
  try {
    const allOrders = await Order.getAllOrders(filterParams);
    return allOrders;
  } catch (error) {
    throw error;
  }
};

const getOneOrder = async (orderNumber) => {
  try {
    const order = await Order.getOneOrder(orderNumber);
    return order;
  } catch (error) {
    throw error;
  }
};

const createNewOrder = async (newOrder) => {
  const total = newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderToInsert = {
    ...newOrder,
    total: total,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  try {
    const createdOrder = await Order.createNewOrder(orderToInsert);
    return createdOrder;
  } catch (error) {
    throw error;
  }
};

const updateOneOrder = async (orderNumber, body) => {
  const updates = {
    ...body,
    updatedAt: new Date()
  };
  try {
    const updatedOrder = await Order.updateOneOrder(orderNumber, updates);
    return updatedOrder;
  } catch (error) {
    throw error;
  }
};

const deleteOneOrder = async (orderNumber) => {
  try {
    const deletedCount = await Order.deleteOneOrder(orderNumber);
    return deletedCount;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllOrders,
  getOneOrder,
  createNewOrder,
  updateOneOrder,
  deleteOneOrder
};
