const mongoose = require('mongoose');

//TO UPDATE for production, connect to local database for testing
const mongoString = '';// process.env.DATABASE_URL;

//Mongoose connection
mongoose.connect(mongoString || 'mongodb://localhost:27017/Tacos3HermanosDB');
const database = mongoose.connection;

database.on('error', (error) => {
  console.log(error);
});

database.once('connected', () => {
  console.log('Database Connected');
});

//Mongo Schema for menu items
const menuItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  shortDescription: String,
  longDescription: String,
  imageURL: String,
  units: String,
  category: [String],
  options: [String],
  availability: Boolean,
  createdAt: String,
  updatedAt: String
});

//Compile schema into a model
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

const getAllMenuItems = async () => {
  let allMenuItems = null;
  let error = null;
  try {
    allMenuItems = await MenuItem.find({});
  }
  catch (e) {
    error = e;
  }
  finally {
    return allMenuItems || error;
  }
};

const getOneMenuItem = async (menuItemName) => {
  const menuItem = await MenuItem.findOne({ name: menuItemName });
  if (!menuItem) return;
  return menuItem;
};

const createNewMenuItem = async (createdMenuItem) => {
  const isAlreadyAdded = await MenuItem.findOne({ name: createdMenuItem.name });
  if (isAlreadyAdded) {
    throw {
      status: 400,
      message: `Item with the name '${createdMenuItem.name}' already exists`,
    };
  }
  const menuItemToInsert = new MenuItem({
    name: createdMenuItem.name,
    price: createdMenuItem.price,
    shortDescription: createdMenuItem.shortDescription,
    longDescription: createdMenuItem.longDescription,
    imageURL: createdMenuItem.imageURL,
    units: createdMenuItem.units,
    category: createdMenuItem.category,
    options: createdMenuItem.options,
    availability: createdMenuItem.availability,
    createdAt: createdMenuItem.createdAt,
    updatedAt: createdMenuItem.updatedAt,
  });

  try {
    await menuItemToInsert.save();
    return createdMenuItem;
  } catch (error) {
    throw { status: 500, message: error?.message || error }; // ?. = optional chaining
  }
};

const updateOneMenuItem = async (menuItemName, update) => {
  options = { new: true };
  const updatedMenuItem = MenuItem.findOneAndUpdate({ name: menuItemName }, update, options);
  return updatedMenuItem;
};

const deleteOneMenuItem = async (menuItemName) => {
  const deletedCount = await MenuItem.deleteOne({ name: menuItemName });
  return deletedCount;
};

module.exports = {
  getAllMenuItems,
  getOneMenuItem,
  createNewMenuItem,
  updateOneMenuItem,
  deleteOneMenuItem
};