const express = require('express');
const req = require('express/lib/request');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');

/**
 * @openapi
 * /api/v1/menuitems:
 *   get:
 *     tags:
 *       - menuItems
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: the category of a menu item
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

router.get('/', menuItemController.getAllMenuItems);

router.get('/:menuItemName', menuItemController.getOneMenuItem);

router.post('/', menuItemController.createNewMenuItem);

router.patch('/:menuItemName', menuItemController.updateOneMenuItem);

router.delete('/:menuItemName', menuItemController.deleteOneMenuItem);

module.exports = router;