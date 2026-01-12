# COURSET-API

A concise README summarizing recent updates and how to get the project running locally.

---

**What's new / Key updates**

- Project uses TypeScript with ES module output (`tsconfig.json` -> `outDir: ./dist`).
- `src/server.ts` now prevents automatic startup when `NODE_ENV === "test"` so tests can import the app safely.
- Configs exported from `src/configs` (env, db, redis). Tests mock these modules to avoid real network connections.
- `src/configs/db.config.ts` added improved connection logging and graceful event handlers.
- Redis connection helper in `src/configs/redis.config.ts` is optional and currently commented out in `server.ts`.
- Tests under `src/__tests__` use Jest + Supertest and mock models/routes to run fast and deterministically.

---

## Tech stack

- Node.js + Express 5
- TypeScript
- MongoDB (Mongoose)
- JWT authentication
- Redis (optional)
- Jest + Supertest for tests

---

## Quick Start

Prerequisites

- Node.js 18+ and npm
- MongoDB (Atlas or local)

Install dependencies

```bash
npm install
```

Create and configure your environment file

```bash
cp .env .env.local
# Edit .env.local: set MONGODB_URI, JWT_SECRET, PORT (optional)
```

Run in development

```bash
npm run dev
```

Build and run (production)

```bash
npm run build
npm start
```

---

## Running tests

Unit and integration tests use Jest + Supertest. Tests mock config modules (`src/configs/*`) and some routes/models to avoid external dependencies.

```bash
npm test
```

If you see issues importing TypeScript files in Jest, `jest.config.cjs` and `ts-jest` are already configured for `**/__tests__/**/*.test.ts`.

---

## Project structure (high level)

- `src/server.ts` — Express app and startup logic. Exports the app so tests can import it without starting the HTTP server.
- `src/routes/` — route definitions (`user.route.ts`, `course.route.ts`).
- `src/controllers/` — request handlers and core logic.
- `src/models/` — Mongoose models.
- `src/configs/` — `env.config.ts`, `db.config.ts`, `redis.config.ts`.
- `src/middlewares/` — authentication and validation middlewares.
- `src/__tests__/` — Jest + Supertest test suites.

---

## API overview

Base path: `/api/v1`

Common endpoints (check `src/routes` for exact paths):

- `POST /api/v1/signup` — register user
- `POST /api/v1/login` — login and get JWT
- `GET /api/v1/users` — list users (protected)
- `GET /api/v1/courses` — list courses
- `POST /api/v1/create-course` — create a course (protected)

Example curl (signup):

```bash
curl -X POST http://localhost:3000/api/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"password"}'
```

---

## Docker

The included `dockerfile` expects a built `dist/` folder. Build locally first, then build the image:

```bash
npm run build
docker build -t courset-api .
docker run -p 3000:3000 --env-file .env courset-api
```

---

## Notes for contributors

- Tests mock config and DB modules — when adding new integration tests, follow the existing mocking pattern in `src/__tests__`.
- Keep `server.ts` exportable without side effects so tests can import the Express app directly.

---

If you'd like, I can also:

- run the test suite locally and report results
- add a short example Postman collection for the main routes
- add a `LICENSE` file and contribution guidelines

_(README generated/updated to reflect recent code changes.)_
