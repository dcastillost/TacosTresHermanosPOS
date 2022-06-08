const express = require('express');
const bodyParser = require('body-parser');
const apicache = require('apicache');

const v1MenuItemRouter = require('./v1/routes/menuItemRoutes');
const v1OrderRouter = require('./v1/routes/orderRoutes');
const { swaggerDocs: V1SwaggerDocs } = require('./v1/swagger.js');

const app = express();
// const cache = apicache.middleware;
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cache("2 minutes"));
app.use('/api/v1/menuitems', v1MenuItemRouter);
app.use('/api/v1/orders', v1OrderRouter);

module.exports = app.listen(PORT, () => {
  console.log(`API server is listening on port ${PORT}`);
  V1SwaggerDocs(app, PORT);
});

// module.exports = app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));