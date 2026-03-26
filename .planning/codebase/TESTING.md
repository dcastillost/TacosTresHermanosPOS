# Testing Patterns

**Analysis Date:** 2026-03-26

## Test Framework

**Server:**
- Runner: Mocha 10.0.0
- Config: No `.mocharc.*` or `mocha.opts` found — uses defaults
- Assertion library: Chai 4.3.6 with chai-http plugin 4.3.0
- HTTP testing: chai-http for making requests to live app
- Run command: `npm test` → `Mocha` (capital M in package.json, expects globally installed or PATH-accessible binary)

**UI:**
- Runner: Jest (via react-scripts 5.0.0)
- Config: Inline in `package.json` eslintConfig (extends `react-app` and `react-app/jest`)
- Testing libraries: @testing-library/react 12.1.3, @testing-library/jest-dom 5.16.2
- Run command: `npm test` → `react-scripts test`
- No explicit test files found in UI source (test infrastructure present but no component tests written)

**Run Commands:**
```bash
# Server
npm test              # Run all Mocha tests (from tacos-tres-hermanos-pos-server/)
npm run dev           # Start dev server with nodemon on port 3000

# UI
npm test              # Run Jest tests (watches by default in CRA)
npm start             # Start development server
npm run build         # Production build
```

## Test File Organization

**Location:**
- Server: Co-located pattern — test file in dedicated `test/` directory at project root
- Test file: `test/menuItem.js` (single file, not co-located with source)
- UI: No actual test files in source (setup only)

**Naming:**
- Server test: `menuItem.js` (matches resource being tested)
- UI: Would follow Jest pattern `*.test.js` or `*.spec.js` (not yet implemented)

**Structure:**
```
tacos-tres-hermanos-pos-server/
├── src/
│   └── v1/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       ├── validators/
│       └── ...
├── test/
│   └── menuItem.js          # All tests in single file
└── package.json

tacos-tres-hermanos-pos-ui/
├── src/
│   ├── components/
│   ├── api/
│   └── setupTests.js        # Test configuration only
└── package.json
```

## Test Structure

**Server Test Suite (Mocha):**
```javascript
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/index');

const should = chai.should();
const API_URI = '/api/v1/menuitems';

chai.use(chaiHttp);

describe('MenuItem endpoints', function () {
  describe('GET all menu items', function () {
    it('should fetch all current menu items', function (done) {
      chai.request(app).keepOpen()
        .get(API_URI)
        .end(function (err, res) {
          should.exist(res.body.data);
          res.body.data.should.be.an('array');
          res.should.have.status(200);
          done();
        });
    });
  });

  // Additional test cases...
});

chai.request(app).close();
```

**Patterns:**
- Nested `describe()` blocks organize tests by endpoint
- Callback-based async handling with `done()` parameter (traditional Mocha pattern)
- Single assertion style throughout: `.should` notation
- Constants defined at top: `API_URI = '/api/v1/menuitems'`

## Mocking

**Framework:** None — tests use **live database connection**

**Integration Testing Approach:**
- No mocked dependencies
- Tests hit the actual MongoDB database directly
- Test data created by actual API calls (POST creates test items, PATCH updates them, DELETE removes them)
- Requires running MongoDB and connected database

**Test Isolation:**
- Tests depend on order of execution:
  - POST creates `testName` item
  - PATCH updates `testName` item
  - DELETE removes `testName` item
  - Subsequent tests assume previous tests have run
- No teardown/cleanup between tests
- No test database seeding or fixtures

**What Gets Tested Live:**
- Actual database operations (Mongoose find, save, deleteOne)
- Full request/response cycle
- Validation middleware execution
- Error handling with real database errors

**What NOT to Mock:**
- HTTP requests (chai-http handles this)
- Database operations (intentionally live)
- External services (none called in tests)

## Fixtures and Factories

**Test Data:**
```javascript
const newTestMenuItem = {
  name: 'testName',
  price: 10,
  shortDescription: 'Short description',
  longDescription: 'Long description',
  imageURL: 'http://www.imageurl.com',
  units: 'test units',
  category: 'test category',
  options: '1',
  availability: 'true',
};

const incompleteTestMenuItem = {
  price: 10,
  shortDescription: 'Short description',
  // Missing required 'name' field
};
```

**Location:**
- Inline in test file (`test/menuItem.js`) — no separate fixtures directory
- Data embedded directly in test cases (lines 87-97 for full item, 114-123 for incomplete item)

**Approach:**
- Ad-hoc test data creation — no factory pattern or builders
- Data hardcoded with realistic values
- One data object per test scenario

## Coverage

**Requirements:** Not enforced — no coverage configuration found

**View Coverage:**
```bash
# Run with coverage (not currently configured)
npm test -- --coverage  # Would work if Jest configured
# or for Mocha:
npm test -- --reporter json-cov > coverage.json
```

**Current Gap:**
- Server: No coverage reporting configured
- UI: Jest supports coverage but not configured in package.json scripts
- No CI/CD pipeline to enforce coverage thresholds

## Test Types

**Unit Tests:**
- Not isolated — all tests are integration tests
- Would test: individual service functions, validators, error handling
- Not currently written in separate form

**Integration Tests:**
- Scope: Full endpoint testing from HTTP request to database
- Approach: Make actual API calls to running server, inspect responses
- All 8 test cases in `test/menuItem.js` are integration tests
- Database state changes expected to persist between tests

**E2E Tests:**
- Not written — not applicable for this monorepo
- UI tests would require browser automation (Cypress/Playwright)
- API tests are already hitting full stack (closest to E2E for server)

## Common Patterns

**Async Testing (Mocha callback style):**
```javascript
it('should fetch all current menu items', function (done) {
  chai.request(app).keepOpen()
    .get(API_URI)
    .end(function (err, res) {
      should.exist(res.body.data);
      res.body.data.should.be.an('array');
      res.should.have.status(200);
      done();  // Signal test completion
    });
});
```

**Error Testing:**
```javascript
it('should not fetch a non existing item', function (done) {
  const nameItem = 'NegaCarnitas';
  chai.request(app)
    .get(`${API_URI}/${nameItem}`)
    .end(function (err, res) {
      should.exist(res.body.data);
      res.body.data.should.have.property('error');
      res.should.have.status(404);
      done();
    });
});
```

**Assertion Style:**
```javascript
// Chai should syntax used throughout
res.should.have.status(200);
res.body.data.should.be.an('array');
res.body.data.should.have.property('name').eq('testName');
should.exist(res.body.data);
```

**Request Building:**
```javascript
chai.request(app)
  .get('/api/v1/menuitems')              // GET request
  .end(callback);

chai.request(app)
  .post('/api/v1/menuitems')
  .send(newTestMenuItem)                 // Send body
  .end(callback);

chai.request(app)
  .patch(`/api/v1/menuitems/${itemName}`)
  .send(dataToUpdate)
  .end(callback);
```

## Test Coverage Summary

**MenuItem Endpoints (8 tests in `test/menuItem.js`):**

1. **GET all items** (1 test)
   - Happy path: Fetch all menu items, assert array response, status 200

2. **GET items with filter** (1 test)
   - Query parameter: Filter by category=beef, assert array, status 200

3. **GET single item** (2 tests)
   - Happy path: Fetch 'Carnitas', assert object with _id and name properties, status 200
   - Error path: Fetch non-existent 'NegaCarnitas', assert error property, status 404

4. **POST new item** (2 tests)
   - Happy path: Create item with all properties, assert createdAt/updatedAt timestamps, status 201
   - Error path: POST incomplete item (missing 'name'), assert validation errors array, status 400

5. **PATCH update item** (2 tests)
   - Happy path: Update existing item, assert updated properties, status 200
   - Error path: Attempt to update name to existing name, assert error, status 400

6. **DELETE item** (2 tests)
   - Happy path: Delete existing item, status 204 (no content)
   - Error path: Delete non-existent item, assert error, status 404

**Missing Test Coverage:**
- Order endpoints (not implemented, no tests)
- Validation layer (only tested indirectly through POST failure)
- Service layer directly (not tested in isolation)
- Database layer directly (tested through controllers)
- UI components (no test files created)
- Error scenarios for GET with empty name parameter

## Database Requirements

**Tests require:**
- MongoDB running on `mongodb://localhost:27017/Tacos3HermanosDB` (default)
- Or `process.env.DATABASE_URL` set to Atlas connection (currently commented out in code)
- Database must be accessible and writable during test execution
- Existing test data (e.g., 'Carnitas' item) must be seeded in database

**Test Data Persistence:**
- Test-created items remain in database after test run
- Manual cleanup may be needed: delete items named 'testName'
- Subsequent runs may fail if test data conflicts occur

---

*Testing analysis: 2026-03-26*
