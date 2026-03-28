# Plan A: Extract Mongoose Connection to Shared Module

---
wave: 1
depends_on: []
files_modified:
  - tacos-tres-hermanos-pos-server/src/database/connection.js (NEW)
  - tacos-tres-hermanos-pos-server/src/database/menuItem.js
  - tacos-tres-hermanos-pos-server/src/v1/swagger.js
requirements:
  - INFRA-03
autonomous: true
---

## Goal

Extract the `mongoose.connect()` call and connection event handlers from `database/menuItem.js` into a new `database/connection.js` module so that both menuItem and the upcoming order model share a single connection without triggering duplicate connect calls.

## Tasks

<task id="A1">
<title>Create database/connection.js</title>
<read_first>
- tacos-tres-hermanos-pos-server/src/database/menuItem.js (lines 1, 48-60 — current connection code to extract)
- tacos-tres-hermanos-pos-server/src/index.js (to see how dotenv/env vars are loaded — note: dotenv is NOT required in index.js currently)
</read_first>
<action>
Create a new file `tacos-tres-hermanos-pos-server/src/database/connection.js` with the following contents:

1. `require('dotenv').config()` at the top (so DATABASE_URL env var is available)
2. `const mongoose = require('mongoose');`
3. Connection string logic: `const mongoString = process.env.DATABASE_URL || 'mongodb://localhost:27017/Tacos3HermanosDB';`
4. `mongoose.connect(mongoString);`
5. `const database = mongoose.connection;`
6. Error handler: `database.on('error', (error) => { console.log(error); });`
7. Connected handler: `database.once('connected', () => { console.log('Database Connected'); });`
8. Export both: `module.exports = { mongoose, database };`

The file must use CommonJS (`require`/`module.exports`). The `mongoose` export allows other files to use `mongoose.model()` with the connected instance. The `database` export enables future health checks.
</action>
<acceptance_criteria>
- File `tacos-tres-hermanos-pos-server/src/database/connection.js` exists
- File contains `require('dotenv').config()`
- File contains `const mongoose = require('mongoose')`
- File contains `process.env.DATABASE_URL || 'mongodb://localhost:27017/Tacos3HermanosDB'`
- File contains `mongoose.connect(mongoString)`
- File contains `const database = mongoose.connection`
- File contains `database.on('error'`
- File contains `database.once('connected'`
- File contains `module.exports = { mongoose, database }`
</acceptance_criteria>
</task>

<task id="A2">
<title>Refactor menuItem.js to import shared connection</title>
<read_first>
- tacos-tres-hermanos-pos-server/src/database/connection.js (just created in A1)
- tacos-tres-hermanos-pos-server/src/database/menuItem.js (full file — current state)
</read_first>
<action>
Modify `tacos-tres-hermanos-pos-server/src/database/menuItem.js`:

1. Replace `const mongoose = require('mongoose');` (line 1) with `const { mongoose } = require('./connection');`
2. Remove the following lines entirely (lines 48-60):
   - `const mongoString = '';// process.env.DATABASE_URL;`
   - `mongoose.connect(mongoString || 'mongodb://localhost:27017/Tacos3HermanosDB');`
   - `const database = mongoose.connection;`
   - `database.on('error', (error) => { console.log(error); });`
   - `database.once('connected', () => { console.log('Database Connected'); });`
3. Keep ALL other code unchanged — the OpenAPI JSDoc comment block, schema definition, model creation, and all CRUD functions remain exactly as they are.
4. The `const MenuItem = mongoose.model('MenuItem', menuItemSchema);` line continues to work because `mongoose` from connection.js is the same connected instance.
</action>
<acceptance_criteria>
- `tacos-tres-hermanos-pos-server/src/database/menuItem.js` contains `const { mongoose } = require('./connection')`
- `tacos-tres-hermanos-pos-server/src/database/menuItem.js` does NOT contain `mongoose.connect(`
- `tacos-tres-hermanos-pos-server/src/database/menuItem.js` does NOT contain `const database = mongoose.connection`
- `tacos-tres-hermanos-pos-server/src/database/menuItem.js` does NOT contain `database.on('error'`
- `tacos-tres-hermanos-pos-server/src/database/menuItem.js` does NOT contain `database.once('connected'`
- `tacos-tres-hermanos-pos-server/src/database/menuItem.js` still contains `const MenuItem = mongoose.model('MenuItem', menuItemSchema)`
- `tacos-tres-hermanos-pos-server/src/database/menuItem.js` still contains `module.exports =` with all 5 CRUD function exports
</acceptance_criteria>
</task>

<task id="A3">
<title>Update swagger.js to include order route/schema files</title>
<read_first>
- tacos-tres-hermanos-pos-server/src/v1/swagger.js (current apis array)
</read_first>
<action>
Modify `tacos-tres-hermanos-pos-server/src/v1/swagger.js`:

Update the `apis` array in the `options` object from:
```js
apis: ["./src/v1/routes/menuItemRoutes.js", "./src/database/menuItem.js"],
```
to:
```js
apis: [
  "./src/v1/routes/menuItemRoutes.js",
  "./src/v1/routes/orderRoutes.js",
  "./src/database/menuItem.js",
  "./src/database/order.js"
],
```

This ensures that when the order routes and schema are implemented in Plan C, their OpenAPI JSDoc annotations are picked up by Swagger automatically.
</action>
<acceptance_criteria>
- `tacos-tres-hermanos-pos-server/src/v1/swagger.js` contains `./src/v1/routes/orderRoutes.js`
- `tacos-tres-hermanos-pos-server/src/v1/swagger.js` contains `./src/database/order.js`
- `tacos-tres-hermanos-pos-server/src/v1/swagger.js` still contains `./src/v1/routes/menuItemRoutes.js`
- `tacos-tres-hermanos-pos-server/src/v1/swagger.js` still contains `./src/database/menuItem.js`
</acceptance_criteria>
</task>

## Verification

After all tasks complete:
1. `connection.js` exists and is the single source of `mongoose.connect()`
2. `menuItem.js` imports from `./connection` instead of calling `mongoose.connect()` directly
3. No file in `src/database/` other than `connection.js` calls `mongoose.connect()`
4. Swagger config includes both menuItem and order route/schema file paths

## must_haves

- [ ] Single `mongoose.connect()` call lives in `database/connection.js` only
- [ ] `menuItem.js` uses `const { mongoose } = require('./connection')` — no direct connect
- [ ] `connection.js` exports both `mongoose` and `database`
- [ ] Swagger apis array includes order route and schema paths
