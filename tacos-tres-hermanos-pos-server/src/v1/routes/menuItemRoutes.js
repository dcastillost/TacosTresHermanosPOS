const express = require('express');
const req = require('express/lib/request');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');

router.get('/', menuItemController.getAllMenuItems);

router.get('/:menuitemId', menuItemController.getOneMenuItem);

router.post('/', menuItemController.createNewMenuItem);

router.patch('/:menuitemId', menuItemController.updateOneMenuItem);

router.delete('/:workoutId', menuItemController.deleteOneMenuItem);

module.exports = router;