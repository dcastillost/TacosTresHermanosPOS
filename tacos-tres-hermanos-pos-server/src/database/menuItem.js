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

const getAllMenuItems = async (filterParams) => {
  try {
    if (filterParams.category) {
      const allMenuItems = await MenuItem.find({ category: filterParams.category });
      return allMenuItems;
    } else {
      const allMenuItems = await MenuItem.find({});
      return allMenuItems;
    }
  }
  catch (error) {
    throw { status: 500, message: error };
  }
};

const getOneMenuItem = async (menuItemName) => {
  try {
    const menuItem = await MenuItem.findOne({ name: menuItemName });
    if (!menuItem) {
      throw {
        status: 400,
        message: `Can't find workout with name '${menuItemName}'`
      };
    }
    return menuItem;
  } catch (error) {
    throw {
      status: error?.status || 500,
      message: error?.message || error
    };
  }
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
  try {
    //Add a case where the user tries to modify an item's name to the name of another existing item?
    const nameAlreadyExists = await MenuItem.findOne({ name: update.name });
    if (nameAlreadyExists) {
      throw {
        status: 400,
        message: `Item with the name '${update.name}' already exists`,
      };
    }
    const isAlreadyAdded = await MenuItem.findOne({ name: menuItemName });
    if (!isAlreadyAdded) {
      throw {
        status: 400,
        message: `Item with the name '${menuItemName}' doesn't exist`,
      };
    }
    options = { new: true };
    const updatedMenuItem = MenuItem.findOneAndUpdate({ name: menuItemName }, update, options);
    return updatedMenuItem;
  } catch (error) {
    throw { status: error?.status || 500, message: error?.message || error };
  }
};

const deleteOneMenuItem = async (menuItemName) => {
  try {
    const isAlreadyAdded = await MenuItem.findOne({ name: menuItemName });
    if (!isAlreadyAdded) {
      throw {
        status: 400,
        message: `Item with the name '${menuItemName}' doesn't exist`,
      };
    }
    const deletedCount = await MenuItem.deleteOne({ name: menuItemName });
    return deletedCount;
  } catch (error) {
    throw { status: error?.status || 500, message: error?.message || error };
  }
};

module.exports = {
  getAllMenuItems,
  getOneMenuItem,
  createNewMenuItem,
  updateOneMenuItem,
  deleteOneMenuItem
};