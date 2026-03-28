const { mongoose } = require('./connection');

/**
 * @openapi
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Carnitas
 *         price:
 *           type: number
 *           example: 1500
 *         quantity:
 *           type: number
 *           example: 2
 *     Order:
 *       type: object
 *       properties:
 *         orderNumber:
 *           type: number
 *           example: 1
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/OrderItem"
 *         total:
 *           type: number
 *           example: 3000
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card]
 *           example: cash
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *           example: pending
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

//Embedded sub-schema for order items
const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

//Mongo Schema for orders
const orderSchema = new mongoose.Schema({
  orderNumber: { type: Number, required: true },
  items: { type: [orderItemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true, enum: ['cash', 'card'] },
  status: { type: String, required: true, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date },
  updatedAt: { type: Date }
});

//Compile schema into a model
const Order = mongoose.model('Order', orderSchema);

//Helper — get next order number for today
const getNextOrderNumber = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const lastOrder = await Order.findOne({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  }).sort({ orderNumber: -1 });
  return lastOrder ? lastOrder.orderNumber + 1 : 1;
};

const getAllOrders = async (filterParams) => {
  try {
    const query = {};
    if (filterParams.status) {
      query.status = filterParams.status;
    }
    if (filterParams.date) {
      const date = new Date(filterParams.date);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }
    const allOrders = await Order.find(query).sort({ createdAt: -1 });
    return allOrders;
  } catch (error) {
    throw { status: 500, message: error };
  }
};

const getOneOrder = async (orderNumber) => {
  try {
    const order = await Order.findOne({ orderNumber: Number(orderNumber) });
    if (!order) {
      throw {
        status: 404,
        message: `Can't find order with number '${orderNumber}'`
      };
    }
    return order;
  } catch (error) {
    throw {
      status: error?.status || 500,
      message: error?.message || error
    };
  }
};

const createNewOrder = async (orderData) => {
  try {
    const orderNumber = await getNextOrderNumber();
    const orderToInsert = new Order({
      orderNumber: orderNumber,
      items: orderData.items,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      status: orderData.status,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt
    });
    await orderToInsert.save();
    return orderToInsert;
  } catch (error) {
    throw { status: error?.status || 500, message: error?.message || error };
  }
};

const updateOneOrder = async (orderNumber, update) => {
  try {
    const existingOrder = await Order.findOne({ orderNumber: Number(orderNumber) });
    if (!existingOrder) {
      throw {
        status: 404,
        message: `Order with number '${orderNumber}' doesn't exist`
      };
    }
    const options = { new: true };
    const updatedOrder = await Order.findOneAndUpdate(
      { orderNumber: Number(orderNumber) },
      update,
      options
    );
    return updatedOrder;
  } catch (error) {
    throw { status: error?.status || 500, message: error?.message || error };
  }
};

const deleteOneOrder = async (orderNumber) => {
  try {
    const existingOrder = await Order.findOne({ orderNumber: Number(orderNumber) });
    if (!existingOrder) {
      throw {
        status: 404,
        message: `Order with number '${orderNumber}' doesn't exist`
      };
    }
    const deletedCount = await Order.deleteOne({ orderNumber: Number(orderNumber) });
    return deletedCount;
  } catch (error) {
    throw { status: error?.status || 500, message: error?.message || error };
  }
};

module.exports = {
  getAllOrders,
  getOneOrder,
  createNewOrder,
  updateOneOrder,
  deleteOneOrder
};
