const express = require('express');

const v1MenuItemRouter = require('./v1/routes/menuItemRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api/v1/menuitems', v1MenuItemRouter);

app.listen(PORT, () => {
  console.log(`API server is listening on port ${PORT}`);
});

