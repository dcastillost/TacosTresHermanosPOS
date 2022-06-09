const { body } = require('express-validator');

exports.menuItemValidator = [
  body('name', 'Name is required').exists(),
  body('price', 'Price is required').exists(),
  body('price', "Price can't exceed 20k").isInt({ gt: 0, lt: 20000 }),
  body('shortDescription', 'Short description is required').exists(),
  body('longDescription').optional(),
  body('imageURL', 'The image URL is required').exists(),
  body('imageURL', 'Need a valid image URL').isURL(),
  body('units', 'Units are required').exists(),
  body('category', 'At least one category is required').exists(),
  body('options', 'At least one option is required').exists(),
  body('availability', 'Availability is required').exists(),
  body('availability', "Availability must be a boolean value").isIn(['true', 'false', 1, 0]),
];