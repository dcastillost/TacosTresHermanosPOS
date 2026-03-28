# Plan B: Connect React Frontend to Express API with CORS

---
wave: 1
depends_on: []
files_modified:
  - tacos-tres-hermanos-pos-ui/src/api/t3h.js
  - tacos-tres-hermanos-pos-ui/package.json
  - tacos-tres-hermanos-pos-server/package.json
  - tacos-tres-hermanos-pos-server/src/index.js
requirements:
  - INFRA-01
  - INFRA-02
autonomous: true
---

## Goal

Replace the Unsplash placeholder in the React axios client with the POS Express API, configure CRA's development proxy to avoid CORS issues during local development, and install + configure the `cors` npm package on the Express server for production/cross-origin scenarios (e.g., kitchen tablet on a different IP).

## Tasks

<task id="B1">
<title>Replace Unsplash axios instance with POS API client</title>
<read_first>
- tacos-tres-hermanos-pos-ui/src/api/t3h.js (current Unsplash config to replace)
</read_first>
<action>
Rewrite `tacos-tres-hermanos-pos-ui/src/api/t3h.js` to:

```js
//Tacos 3 Hermanos POS API
import axios from 'axios';

export default axios.create({
  baseURL: '/api/v1'
});
```

Key details:
- `baseURL` is the relative path `/api/v1` (no hostname). CRA's proxy will forward this to the Express server during development.
- Remove the Unsplash `Authorization` header entirely — the POS API has no auth.
- Keep the default export pattern (existing components import via `import t3h from '../api/t3h'`).
</action>
<acceptance_criteria>
- `tacos-tres-hermanos-pos-ui/src/api/t3h.js` contains `baseURL: '/api/v1'`
- `tacos-tres-hermanos-pos-ui/src/api/t3h.js` does NOT contain `unsplash`
- `tacos-tres-hermanos-pos-ui/src/api/t3h.js` does NOT contain `Authorization`
- `tacos-tres-hermanos-pos-ui/src/api/t3h.js` contains `export default axios.create(`
</acceptance_criteria>
</task>

<task id="B2">
<title>Add CRA proxy to UI package.json</title>
<read_first>
- tacos-tres-hermanos-pos-ui/package.json (current contents — must add proxy field without breaking existing config)
</read_first>
<action>
Add the following top-level field to `tacos-tres-hermanos-pos-ui/package.json`:

```json
"proxy": "http://localhost:3000"
```

Place it after the `"private": true` line (before `"dependencies"`). This tells CRA's dev server (port 3001 by default) to proxy unrecognized requests to the Express API on port 3000.

Do NOT change any other field in package.json. The file must remain valid JSON.
</action>
<acceptance_criteria>
- `tacos-tres-hermanos-pos-ui/package.json` contains `"proxy": "http://localhost:3000"`
- `tacos-tres-hermanos-pos-ui/package.json` is valid JSON (no trailing commas, no syntax errors)
- All existing fields (`name`, `version`, `private`, `dependencies`, `scripts`, `eslintConfig`, `browserslist`) are still present and unchanged
</acceptance_criteria>
</task>

<task id="B3">
<title>Install cors package on Express server</title>
<read_first>
- tacos-tres-hermanos-pos-server/package.json (verify cors is not already a dependency)
</read_first>
<action>
Run the following command from the server directory:

```bash
cd tacos-tres-hermanos-pos-server && npm install cors
```

This adds the `cors` package to the `dependencies` section of `tacos-tres-hermanos-pos-server/package.json`.
</action>
<acceptance_criteria>
- `tacos-tres-hermanos-pos-server/package.json` contains `"cors"` in the `dependencies` object
- `tacos-tres-hermanos-pos-server/node_modules/cors/` directory exists
</acceptance_criteria>
</task>

<task id="B4">
<title>Configure CORS middleware on Express app</title>
<read_first>
- tacos-tres-hermanos-pos-server/src/index.js (current middleware stack and route registration order)
</read_first>
<action>
Modify `tacos-tres-hermanos-pos-server/src/index.js`:

1. Add a new require at the top of the file, after the existing requires (after line 3):
   ```js
   const cors = require('cors');
   ```

2. Add CORS middleware BEFORE the bodyParser middleware lines (before `app.use(bodyParser.json())`). Insert:
   ```js
   app.use(cors({
     origin: [
       'http://localhost:3001',
       'http://localhost:3000'
     ],
     methods: ['GET', 'POST', 'PATCH', 'DELETE'],
   }));
   ```

   The `origin` array allows requests from:
   - `http://localhost:3001` — CRA dev server default port
   - `http://localhost:3000` — same-origin requests

   Note: For kitchen tablets on the local network, the operator will need to add the server's LAN IP (e.g., `http://192.168.1.x:3000`) to this array. This is documented as a known concern in STATE.md.

3. Keep all other lines in index.js unchanged.

The final require block at the top should be:
```js
const express = require('express');
const bodyParser = require('body-parser');
const apicache = require('apicache');
const cors = require('cors');
```
</action>
<acceptance_criteria>
- `tacos-tres-hermanos-pos-server/src/index.js` contains `const cors = require('cors')`
- `tacos-tres-hermanos-pos-server/src/index.js` contains `app.use(cors(`
- `tacos-tres-hermanos-pos-server/src/index.js` contains `'http://localhost:3001'`
- `tacos-tres-hermanos-pos-server/src/index.js` contains `'http://localhost:3000'`
- `tacos-tres-hermanos-pos-server/src/index.js` contains `methods: ['GET', 'POST', 'PATCH', 'DELETE']`
- The `cors()` middleware call appears BEFORE `bodyParser.json()` in the file
- All existing route registrations (`/api/v1/menuitems`, `/api/v1/orders`) are still present
</acceptance_criteria>
</task>

## Verification

After all tasks complete:
1. `t3h.js` creates an axios instance pointed at `/api/v1` (relative)
2. CRA proxy is set to `http://localhost:3000` in UI package.json
3. Express server has `cors` installed and configured as middleware
4. CORS allows requests from localhost:3001 (CRA dev server)

## must_haves

- [ ] Axios baseURL is `/api/v1` (relative path, no Unsplash reference)
- [ ] CRA proxy set to `http://localhost:3000` in UI package.json
- [ ] `cors` package installed in server dependencies
- [ ] CORS middleware configured with `localhost:3001` origin before body parser
