/*
API SERVER

Description:
RESTful API server that handles HTTP requests.

For refactoring:
Always returns JSON.
Error and exception handling.
*/

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
  slug: String,
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

/*
MENU ROUTING:
-GET all menu items
-POST one menu item
-DELETE all menu items
  //Add warning/extra security for this action.
*/
app.route('/menu')
  .get((req, res) => {
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
  })
  .post((req, res) => {
    try {
      const newMenuItem = new MenuItem({
        name: req.body.name,
        slug: req.body.slug,
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
        if (!err) {
          res.send('New menu item added to database.')
        } else {
          res.send(err);
        }
      });
    }
    catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .delete((req, res) => {
    MenuItem.deleteMany((err) => {
      if (!err) {
        res.send('All menu items have been deleted.');
      } else {
        res.send(err);
      }
    });
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

/*
MENU ITEM ROUTING
-GET one menu item
-PUT one menu item (update item from scratch)
-DELETE one menu item
-PATCH menu item / ingredient availability
*/
app.route('/menu/:menuItemSlug')
  .get((req, res) => {
    MenuItem.findOne({ slug: req.params.menuItemSlug }, (err, foundMenuItem) => {
      if (foundMenuItem) {
        res.json(foundMenuItem);
      } else {
        res.send('No item menu was found under that slug.')
      }
    });
  })
  .put((req, res) => {
    const filter = { slug: req.params.menuItemSlug };
    const replacement = {
      name: req.body.name,
      slug: req.body.slug,
      price: req.body.price,
      shortDescription: req.body.shortDescription,
      longDescription: req.body.longDescription,
      units: req.body.units,
      options: parseInt(req.body.options),
      category: req.body.category,
      imageURL: req.body.imageURL,
      availability: req.body.availability
    };
    MenuItem.replaceOne(filter, replacement, (err) => {
      if (!err) {
        res.send('Successfully replaced menu item.');
      } else {
        // res.send('No matching items found.');
        res.send(err);
      }
    });
  })
  .delete((req, res) => {
    filter = { slug: req.params.menuItemSlug };
    MenuItem.deleteOne(filter, (err) => {
      if (!err) {
        res.send('Successfully deleted menu item.');
      } else {
        // res.send('No matching items found.');
        res.send(err);
      }
    });
  })
  .patch((req, res) => {
    const filter = { slug: req.params.menuItemSlug };
    const updates = {
      $set: {
        name: req.body.name,
        // slug: req.body.slug,
        price: req.body.price,
        // shortDescription: req.body.shortDescription,
        // longDescription: req.body.longDescription,
        // units: req.body.units,
        // options: parseInt(req.body.options),
        // category: req.body.category,
        // imageURL: req.body.imageURL,
        // availability: req.body.availability
      }
    };
    MenuItem.updateOne(filter, updates, (err) => {
      if (!err) {
        res.send('Successfully updated menu item.');
      } else {
        // res.send('No matching items found.');
        res.send(err);
      }
    });
  });

//GET ALL orders

//GET order based on id

//POST order

//POST new ingredient

//Patch order status

