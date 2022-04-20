require("dotenv").config();
const express = require('express');
const bodyParser = require("body-parser");
const ejs = require('ejs');
const mongoose = require('mongoose');

//Constants
const mongoString = process.env.DATABASE_URL;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize server
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log('Server started on port 3000');
});

//Mongoose connection
// mongoose.connect(mongoString);
mongoose.connect('mongodb://localhost:27017/Tacos3HermanosDB');
const database = mongoose.connection;

database.on('error', (error) => {
  console.log(error);
})

database.once('connected', () => {
  console.log('Database Connected');
})

//Mongo Schema for menu items
const menuItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  shortDescription: String,
  longDescription: String,
  units: String,
  options: [Number],
  category: [String, String],
  imageURL: String,
  availability: Boolean
});

//Compile schema into a model
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

//Get ALL menu items
app.get('/menu', (req, res) => {
  try {
    MenuItem.find((err, menuItems) => {
      if (!err) {
        res.json(menuItems);
      }
      else {
        res.json(err);
      }
    });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//GET items based on category
app.get('/menu/category', (req, res) => {
  try {
    MenuItem.find((err, menuItems) => {
      if (!err) {
        res.json(menuItems);
      }
      else {
        res.json(err);
      }
    });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//GET one item based on id

//GET ALL orders

//GET order based on id

//POST order

//POST new menu item
app.post('/menu', (req, res) => {
  try {
    const newMenuItem = new MenuItem({
      name: req.body.name,
      price: req.body.price,
      shortDescription: req.body.shortDescription,
      longDescription: req.body.longDescription,
      units: req.body.units,
      options: parseInt(req.body.options),
      category: req.body.category,
      imageURL: req.body.imageURL,
      availability: req.body.availability
    });
    newMenuItem.save(err => {
      if(!err) {
        res.send('New menu item added to database.')
      } else {
        res.send(err);
      }
    });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//POST new ingredient

//PATCH menu item / ingredient availability

//Patch order status

//DELETE all menu items
//Add warning/extra security for this action.
app.delete('/menu', (req, res) => {
  MenuItem.deleteMany((err) => {
    if(!err) {
      res.send('All menu items have been deleted.');
    } else {
      res.send(err);
    }
  });
});

