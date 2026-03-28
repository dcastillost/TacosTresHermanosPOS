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
