# Technology Stack

**Analysis Date:** 2026-03-26

## Languages

**Primary:**
- JavaScript (Node.js) - Server API, CommonJS modules
- JavaScript (ES6+) - Frontend UI, ES modules
- JSX/TSX - React component development

**Secondary:**
- None identified

## Runtime

**Environment:**
- Node.js - Backend runtime (version inferred from package-lock lockfileVersion 2, suggesting Node 12+)

**Package Manager:**
- npm - Primary package manager for both sub-projects
- Lockfile: Present (package-lock.json in both sub-projects)

## Frameworks

**Core:**
- Express.js 4.17.3 - Server REST API framework (`tacos-tres-hermanos-pos-server`)
- React 17.0.2 - Frontend UI framework (`tacos-tres-hermanos-pos-ui`)
- React Router DOM 5.3.1 - Client-side routing (`tacos-tres-hermanos-pos-ui`)

**Testing:**
- Mocha 10.0.0 - Server test runner (`tacos-tres-hermanos-pos-server`)
- Chai 4.3.6 - Server assertion library
- chai-http 4.3.0 - HTTP integration testing for server
- Supertest 6.2.3 - HTTP assertion helper
- Jest 5.0.0 (via react-scripts) - Frontend test runner (`tacos-tres-hermanos-pos-ui`)
- React Testing Library 12.1.3 - React component testing utilities

**Build/Dev:**
- react-scripts 5.0.0 - Create React App build tools and scripts
- nodemon - Development server auto-reload (`tacos-tres-hermanos-pos-server`)

## Key Dependencies

**Critical:**
- mongoose 6.3.0 - MongoDB object modeling and database abstraction (`tacos-tres-hermanos-pos-server`)
- express-validator 6.14.1 - Input validation middleware (`tacos-tres-hermanos-pos-server`)
- axios 0.26.1 - HTTP client for making API requests (`tacos-tres-hermanos-pos-ui`)

**Infrastructure:**
- body-parser 1.20.0 - Express middleware for parsing request bodies
- dotenv 16.0.0 - Environment variable loading for both projects
- apicache 1.6.3 - API response caching middleware (currently disabled in `src/index.js`)
- swagger-jsdoc 6.2.1 - OpenAPI documentation generation from JSDoc
- swagger-ui-express 4.4.0 - Swagger UI serving for API documentation
- ejs 3.0.2 - Template engine (present but unused in current implementation)

**Frontend utilities:**
- react-dom 17.0.2 - React DOM rendering
- web-vitals 2.1.4 - Web performance metrics

## Configuration

**Environment:**
- `.env` file required in both sub-projects (location: `tacos-tres-hermanos-pos-server/.env` and `tacos-tres-hermanos-pos-ui/.env`)
- dotenv loads environment variables at runtime
- No configuration files (no tsconfig.json, no .eslintrc, no .prettierrc detected)

**Build:**
- Create React App default configuration (embedded in react-scripts)
- Express app listen port: `process.env.PORT || 3000` in `src/index.js`
- MongoDB connection: `mongodb://localhost:27017/Tacos3HermanosDB` (hardcoded default, environment variable commented out)

## Platform Requirements

**Development:**
- Node.js with npm
- MongoDB server (local or Atlas connection string via `.env`)
- A modern browser (Chrome, Firefox, Safari)

**Production:**
- Node.js server with npm dependencies installed
- MongoDB instance (Atlas URI or self-hosted)
- Static hosting or Node.js server for React build output

---

*Stack analysis: 2026-03-26*
