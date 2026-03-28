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
