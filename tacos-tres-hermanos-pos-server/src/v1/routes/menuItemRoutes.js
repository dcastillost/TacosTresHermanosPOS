const express = require('express');
const req = require('express/lib/request');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');

router.get('/', menuItemController.getAllMenuItems);

router.get('/:menuItemName', menuItemController.getOneMenuItem);

router.post('/', menuItemController.createNewMenuItem);

router.patch('/:menuItemName', menuItemController.updateOneMenuItem);

router.delete('/:menuItemName', menuItemController.deleteOneMenuItem);

module.exports = router;