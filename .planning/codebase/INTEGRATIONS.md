# External Integrations

**Analysis Date:** 2026-03-26

## APIs & External Services

**Search/Image API:**
- Unsplash API - Search and fetch photo results
  - SDK/Client: axios (via `tacos-tres-hermanos-pos-ui/src/api/t3h.js`)
  - Auth: Bearer token (Client-ID header: `jmNqMcKBP2AcMPEyE9GWodZg9Zqf7qZLEDKbSyvfhCo`)
  - Usage: Frontend search functionality searches Unsplash photos instead of POS server (see `src/components/App.js` onSearchSubmit)

**Internal APIs:**
- POS Server API endpoints (not yet consumed by UI):
  - `/api/v1/menuitems` - Menu item CRUD operations (`src/v1/routes/menuItemRoutes.js`)
  - `/api/v1/orders` - Order operations stub (`src/v1/routes/orderRoutes.js`)
  - `/api/v1/docs` - Swagger/OpenAPI documentation at this endpoint

**Authentication Services:**
- Google API - Google Sign-In / OAuth 2.0
  - SDK: Google API JavaScript client (loaded from `https://apis.google.com/js/api.js` in `public/index.html`)
  - Implementation: `src/components/GoogleAuth.js` uses `window.gapi.client.init()`
  - Status: Component exists but integration is incomplete/unused

## Data Storage

**Databases:**
- MongoDB
  - Connection: `mongodb://localhost:27017/Tacos3HermanosDB` (default, hardcoded in `src/database/menuItem.js`)
  - Alternative: `.env` variable `DATABASE_URL` available but commented out
  - Client: Mongoose 6.3.0 ODM
  - Schema: MenuItem model defined in `src/database/menuItem.js` with fields for name, price, descriptions, categories, options, timestamps

**File Storage:**
- Local filesystem only - Images referenced via URL strings in MenuItem `imageURL` field
- No cloud storage (S3, GCS, etc.) integrated

**Caching:**
- apicache 1.6.3 available but currently disabled (commented out in `src/index.js`)

## Authentication & Identity

**Auth Provider:**
- Google OAuth 2.0 (partially integrated)
  - Implementation: `src/components/GoogleAuth.js` with gapi.client initialization
  - Status: Experimental/unused component

**Custom:**
- No custom authentication system implemented
- No API endpoint protection/authorization currently in place

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Console logging only (`console.log()` statements in server startup and Mongoose connection events)
- No centralized logging service

## CI/CD & Deployment

**Hosting:**
- Not specified/Not configured in codebase
- Server: Designed to run on Node.js (port 3000)
- UI: Build output suitable for static hosting or Node.js server

**CI Pipeline:**
- None detected (no GitHub Actions, Jenkins, Travis CI configuration found)

## Environment Configuration

**Required env vars:**

Server (`tacos-tres-hermanos-pos-server/.env`):
- `PORT` (optional, defaults to 3000)
- `DATABASE_URL` (optional, defaults to local MongoDB at `mongodb://localhost:27017/Tacos3HermanosDB`)

UI (`tacos-tres-hermanos-pos-ui/.env`):
- `REACT_APP_*` variables (if needed for build-time configuration)

**Secrets location:**
- `.env` files in each sub-project directory
- Hardcoded Unsplash API key in `src/api/t3h.js` and `src/components/App.js` (SECURITY RISK)
- `.env` files are git-ignored but not explicitly documented in `.gitignore` review

## Webhooks & Callbacks

**Incoming:**
- None detected - Order endpoint is a stub with no implementation

**Outgoing:**
- None detected

## API Response Format

All API responses follow consistent schema in `src/v1/controllers/`:
```json
{
  "status": "OK" | "FAILED",
  "data": [object|array|null]
}
```

---

*Integration audit: 2026-03-26*
