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

const getOneMenuItem = () => {
  return;
};

const createNewMenuItem = () => {
  return;
};

const updateOneMenuItem = () => {
  return;
};

const deleteOneMenuItem = () => {
  return;
};

module.exports = {
  getAllMenuItems,
  getOneMenuItem,
  createNewMenuItem,
  updateOneMenuItem,
  deleteOneMenuItem
};

