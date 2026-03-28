# Plan C: Implement Order Data Model and API Layer

---
wave: 2
depends_on:
  - 01-01-connection-refactor
files_modified:
  - tacos-tres-hermanos-pos-server/src/database/order.js
  - tacos-tres-hermanos-pos-server/src/v1/services/orderService.js
  - tacos-tres-hermanos-pos-server/src/v1/validators/orderValidator.js (NEW)
  - tacos-tres-hermanos-pos-server/src/v1/controllers/orderController.js
  - tacos-tres-hermanos-pos-server/src/v1/routes/orderRoutes.js
requirements:
  - INFRA-04
autonomous: true
---

## Goal

Implement the complete order resource across all server layers — Mongoose schema with native Date timestamps, validated status enum, embedded item price snapshots, auto-incrementing daily order numbers, and full CRUD API following the established menuItem pattern.

## Tasks

<task id="C1">
<title>Implement Order Mongoose schema and database CRUD in order.js</title>
<read_first>
- tacos-tres-hermanos-pos-server/src/database/order.js (currently empty — will be completely rewritten)
- tacos-tres-hermanos-pos-server/src/database/menuItem.js (reference pattern for schema definition, OpenAPI JSDoc, and CRUD functions)
- tacos-tres-hermanos-pos-server/src/database/connection.js (created in Plan A — import mongoose from here)
</read_first>
<action>
Rewrite `tacos-tres-hermanos-pos-server/src/database/order.js` with the following complete implementation:

**1. Import:**
```js
const { mongoose } = require('./connection');
```

**2. OpenAPI Schema JSDoc** (before the schema definition):
```js
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
```

**3. Embedded sub-schema for order items:**
```js
const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });
```
Note: `{ _id: false }` prevents Mongoose from generating `_id` for each sub-document — items are identified by name within the order.

**4. Order schema:**
```js
const orderSchema = new mongoose.Schema({
  orderNumber: { type: Number, required: true },
  items: { type: [orderItemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true, enum: ['cash', 'card'] },
  status: { type: String, required: true, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date },
  updatedAt: { type: Date }
});
```

**5. Model:**
```js
const Order = mongoose.model('Order', orderSchema);
```

**6. Helper — get next order number for today:**
```js
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
```

**7. CRUD functions** (follow menuItem.js error pattern with `throw { status, message }`):

```js
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
```

**8. Export:**
```js
module.exports = {
  getAllOrders,
  getOneOrder,
  createNewOrder,
  updateOneOrder,
  deleteOneOrder
};
```
</action>
<acceptance_criteria>
- `tacos-tres-hermanos-pos-server/src/database/order.js` contains `const { mongoose } = require('./connection')`
- File contains `@openapi` JSDoc block with `OrderItem` and `Order` schema definitions
- File contains `const orderItemSchema = new mongoose.Schema(`
- File contains `name: { type: String, required: true }`
- File contains `price: { type: Number, required: true }`
- File contains `quantity: { type: Number, required: true, min: 1 }`
- File contains `{ _id: false }`
- File contains `const orderSchema = new mongoose.Schema(`
- File contains `orderNumber: { type: Number, required: true }`
- File contains `paymentMethod: { type: String, required: true, enum: ['cash', 'card'] }`
- File contains `status: { type: String, required: true, enum: ['pending', 'completed', 'cancelled']`
- File contains `createdAt: { type: Date }`
- File contains `updatedAt: { type: Date }`
- File contains `const Order = mongoose.model('Order', orderSchema)`
- File contains `const getNextOrderNumber = async ()`
- File contains `module.exports =` with `getAllOrders`, `getOneOrder`, `createNewOrder`, `updateOneOrder`, `deleteOneOrder`
- File does NOT contain `mongoose.connect(`
</acceptance_criteria>
</task>

<task id="C2">
<title>Implement order service layer</title>
<read_first>
- tacos-tres-hermanos-pos-server/src/v1/services/orderService.js (current stub to replace)
- tacos-tres-hermanos-pos-server/src/v1/services/menuItemService.js (reference pattern — timestamp management, service-to-database delegation)
</read_first>
<action>
Rewrite `tacos-tres-hermanos-pos-server/src/v1/services/orderService.js`:

```js
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
```

Key differences from menuItem service:
- `createdAt` and `updatedAt` use `new Date()` (native Date objects) instead of `new Date().toLocaleString(...)` — this is decision D-04 for MongoDB aggregation compatibility.
- `total` is calculated server-side from `items` array: `items.reduce((sum, item) => sum + (item.price * item.quantity), 0)` — decision D-02.
- `status` is always set to `'pending'` on creation — decision D-06.
- Uses `const updates` (not bare `updates`) to fix the undeclared variable pattern from menuItemService line 38.
</action>
<acceptance_criteria>
- `tacos-tres-hermanos-pos-server/src/v1/services/orderService.js` contains `const Order = require('../../database/order')`
- File contains `const total = newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)`
- File contains `total: total`
- File contains `status: 'pending'`
- File contains `createdAt: new Date()`
- File contains `updatedAt: new Date()`
- File does NOT contain `toLocaleString`
- File contains `const updates = {` (properly declared with const)
- File contains `module.exports =` with all 5 function names
</acceptance_criteria>
</task>

<task id="C3">
<title>Create order validator middleware</title>
<read_first>
- tacos-tres-hermanos-pos-server/src/v1/validators/menuItemValidator.js (reference pattern for express-validator middleware array)
</read_first>
<action>
Create new file `tacos-tres-hermanos-pos-server/src/v1/validators/orderValidator.js`:

```js
const { body } = require('express-validator');

exports.orderValidator = [
  body('items', 'Items array is required').exists(),
  body('items', 'Items must be a non-empty array').isArray({ min: 1 }),
  body('items.*.name', 'Each item must have a name').exists().isString(),
  body('items.*.price', 'Each item must have a price').exists(),
  body('items.*.price', 'Item price must be a positive number').isFloat({ gt: 0 }),
  body('items.*.quantity', 'Each item must have a quantity').exists(),
  body('items.*.quantity', 'Item quantity must be a positive integer').isInt({ gt: 0 }),
  body('paymentMethod', 'Payment method is required').exists(),
  body('paymentMethod', 'Payment method must be cash or card').isIn(['cash', 'card']),
];
```

This validates:
- `items` is a non-empty array
- Each item in the array has `name` (string), `price` (positive float), and `quantity` (positive integer)
- `paymentMethod` is one of `cash` or `card`

Note: `total` is NOT validated from the client — it is calculated server-side in the service layer. `status` is NOT validated — it is always set to `pending` on creation.
</action>
<acceptance_criteria>
- File `tacos-tres-hermanos-pos-server/src/v1/validators/orderValidator.js` exists
- File contains `const { body } = require('express-validator')`
- File contains `exports.orderValidator = [`
- File contains `body('items', 'Items array is required').exists()`
- File contains `body('items', 'Items must be a non-empty array').isArray({ min: 1 })`
- File contains `body('items.*.name'`
- File contains `body('items.*.price'`
- File contains `body('items.*.quantity'`
- File contains `body('paymentMethod', 'Payment method is required').exists()`
- File contains `body('paymentMethod', 'Payment method must be cash or card').isIn(['cash', 'card'])`
</acceptance_criteria>
</task>

<task id="C4">
<title>Implement order controller with full CRUD</title>
<read_first>
- tacos-tres-hermanos-pos-server/src/v1/controllers/orderController.js (current stub to replace)
- tacos-tres-hermanos-pos-server/src/v1/controllers/menuItemController.js (reference pattern — catch500Error helper, validationResult checking, response envelope)
</read_first>
<action>
Rewrite `tacos-tres-hermanos-pos-server/src/v1/controllers/orderController.js`:

```js
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
```

Key points matching menuItem controller pattern:
- Uses `validationResult(req)` to check express-validator results on POST
- Uses `catch500Error` helper with same signature
- Response envelope: `{ status: "OK"|"FAILED", data: ... }`
- Parameter validation with early return for missing params
- Route param is `orderNumber` (not `orderId` — matching decision D-05 for daily numbering)
- `createNewOrder` only passes `items` and `paymentMethod` from body — `total`, `status`, `createdAt`, `updatedAt` are set server-side in the service layer
- `getAllOrders` accepts `status` and `date` query params for filtering
</action>
<acceptance_criteria>
- `tacos-tres-hermanos-pos-server/src/v1/controllers/orderController.js` contains `const { validationResult } = require('express-validator')`
- File contains `const orderService = require('../services/orderService')`
- File contains `async (req, res)` for all 5 handler functions
- File contains `res.json({ status: "OK", data: allOrders })`
- File contains `res.status(201).json({ status: "OK", data: createdOrder })`
- File contains `res.status(204).send({ status: "OK" })`
- File contains `const catch500Error = (error, res) =>`
- File contains `validationResult(req)` in the createNewOrder function
- File contains `params: { orderNumber }` (not `orderId`)
- File contains `const { status, date } = req.query`
- File does NOT contain `console.log(allOrders)` (removed from stub)
- File does NOT contain `res.send("Get all orders")` (stub responses replaced)
</acceptance_criteria>
</task>

<task id="C5">
<title>Update order routes with validator and OpenAPI docs</title>
<read_first>
- tacos-tres-hermanos-pos-server/src/v1/routes/orderRoutes.js (current stub routes to replace)
- tacos-tres-hermanos-pos-server/src/v1/routes/menuItemRoutes.js (reference pattern for OpenAPI JSDoc and validator middleware usage)
</read_first>
<action>
Rewrite `tacos-tres-hermanos-pos-server/src/v1/routes/orderRoutes.js`:

```js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { orderValidator } = require('../validators/orderValidator');

/**
 * @openapi
 * /api/v1/orders:
 *   get:
 *     tags:
 *       - orders
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filter orders by status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders by date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Order"
 *       5XX:
 *         description: FAILED
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: FAILED
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Some error message"
 */
router.get('/', orderController.getAllOrders);

/**
 * @openapi
 * /api/v1/orders/{orderNumber}:
 *   get:
 *     tags:
 *       - orders
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: The order number
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   $ref: "#/components/schemas/Order"
 *       404:
 *         description: Order not found
 */
router.get('/:orderNumber', orderController.getOneOrder);

/**
 * @openapi
 * /api/v1/orders:
 *   post:
 *     tags:
 *       - orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - paymentMethod
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/OrderItem"
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card]
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   $ref: "#/components/schemas/Order"
 *       400:
 *         description: Validation error
 */
router.post('/', orderValidator, orderController.createNewOrder);

/**
 * @openapi
 * /api/v1/orders/{orderNumber}:
 *   patch:
 *     tags:
 *       - orders
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:orderNumber', orderController.updateOneOrder);

/**
 * @openapi
 * /api/v1/orders/{orderNumber}:
 *   delete:
 *     tags:
 *       - orders
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Order not found
 */
router.delete('/:orderNumber', orderController.deleteOneOrder);

module.exports = router;
```

Key changes from stub:
- Route params changed from `:orderId` to `:orderNumber` (matching decision D-05)
- `orderValidator` middleware added to POST route
- Full OpenAPI JSDoc annotations for all 5 endpoints
- References `#/components/schemas/Order` and `#/components/schemas/OrderItem` (defined in database/order.js)
</action>
<acceptance_criteria>
- `tacos-tres-hermanos-pos-server/src/v1/routes/orderRoutes.js` contains `const { orderValidator } = require('../validators/orderValidator')`
- File contains `router.post('/', orderValidator, orderController.createNewOrder)`
- File contains `/:orderNumber` (not `/:orderId`) in all route definitions
- File contains `@openapi` JSDoc blocks
- File contains `$ref: "#/components/schemas/Order"`
- File contains `$ref: "#/components/schemas/OrderItem"`
- File contains `tags:` with `- orders` in JSDoc blocks
- File contains `router.get('/', orderController.getAllOrders)`
- File contains `router.get('/:orderNumber', orderController.getOneOrder)`
- File contains `router.patch('/:orderNumber', orderController.updateOneOrder)`
- File contains `router.delete('/:orderNumber', orderController.deleteOneOrder)`
- File contains `module.exports = router`
</acceptance_criteria>
</task>

## Verification

After all tasks complete:
1. Order schema exists with `orderNumber` (Number), `items` (embedded array with name/price/quantity), `total` (Number), `paymentMethod` (enum: cash/card), `status` (enum: pending/completed/cancelled), `createdAt` (Date), `updatedAt` (Date)
2. All 5 layers are wired: routes → validator → controller → service → database
3. Timestamps use native `Date` (not locale strings)
4. Total is calculated server-side from items array
5. Order numbers auto-increment daily
6. Status defaults to `pending` on creation
7. OpenAPI docs cover all order endpoints
8. No file in `src/database/` other than `connection.js` calls `mongoose.connect()`

## must_haves

- [ ] Order schema has `createdAt: { type: Date }` and `updatedAt: { type: Date }` — native Date, not String
- [ ] Order schema has `status` with enum `['pending', 'completed', 'cancelled']`
- [ ] Order schema has `paymentMethod` with enum `['cash', 'card']`
- [ ] Items are embedded sub-documents with `name`, `price`, `quantity` — no ObjectId references
- [ ] Order number auto-increments per day via `getNextOrderNumber()`
- [ ] Total calculated server-side: `items.reduce((sum, item) => sum + (item.price * item.quantity), 0)`
- [ ] Validator middleware validates `items` array and `paymentMethod` enum
- [ ] All 5 endpoints use `:orderNumber` param (not `:orderId`)
- [ ] `order.js` imports mongoose from `./connection` (not direct `require('mongoose')`)
