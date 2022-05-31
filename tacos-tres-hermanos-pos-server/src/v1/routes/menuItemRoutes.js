const express = require('express');
const req = require('express/lib/request');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');

/**
 * @openapi
 * /api/v1/menuItems:
 *   get:
 *     tags:
 *       - menuItems
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
 *                     $ref: "#/components/schemas/MenuItem"
 */

router.get('/', menuItemController.getAllMenuItems);

router.get('/:menuItemName', menuItemController.getOneMenuItem);

router.post('/', menuItemController.createNewMenuItem);

router.patch('/:menuItemName', menuItemController.updateOneMenuItem);

router.delete('/:menuItemName', menuItemController.deleteOneMenuItem);

module.exports = router;