<div id="top">

<!-- HEADER STYLE: CLASSIC -->
<div align="center">

# COURSET-API

<em>Empowering Learning, Accelerating Success Seamlessly</em>

<!-- BADGES -->
<img src="https://img.shields.io/github/last-commit/nadjii-djelama/courset-api?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/nadjii-djelama/courset-api?style=flat&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/nadjii-djelama/courset-api?style=flat&color=0080ff" alt="repo-language-count">

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/Express-000000.svg?style=flat&logo=Express&logoColor=white" alt="Express">
<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" alt="JSON">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/Mongoose-F04D35.svg?style=flat&logo=Mongoose&logoColor=white" alt="Mongoose">
<img src="https://img.shields.io/badge/.ENV-ECD53F.svg?style=flat&logo=dotenv&logoColor=black" alt=".ENV">
<br>
<img src="https://img.shields.io/badge/MongoDB-47A248.svg?style=flat&logo=MongoDB&logoColor=white" alt="MongoDB">
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/tsnode-3178C6.svg?style=flat&logo=ts-node&logoColor=white" alt="tsnode">
<img src="https://img.shields.io/badge/Jest-C21325.svg?style=flat&logo=Jest&logoColor=white" alt="Jest">

</div>
<br>

---

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Testing](#testing)

---

## Overview

courset-api is a full-featured backend API designed to power educational platforms with secure user and course management. Built with Node.js, Express, and MongoDB, it offers a scalable and maintainable architecture for modern web applications.

**Why courset-api?**

This project simplifies backend development for course-based applications, ensuring secure data handling and role-based access control. The core features include:

- 🛡️ **🔑 Authentication & Authorization:** JWT-based security with role enforcement to protect sensitive endpoints.
- 🚀 **RESTful API Endpoints:** Efficient CRUD operations for courses and users, supporting flexible content management.
- 🧪 **Built-in Testing & Docker Support:** Ensures code quality and easy deployment across environments.
- 📝 **Data Validation Middleware:** Maintains data integrity with comprehensive validation rules.
- 🔧 **Config Management:** Environment-specific settings and reliable database connection setup.

---

# COURSET-API

A lightweight backend API for course and user management built with TypeScript, Express, and MongoDB.

---

## Summary

- Language: TypeScript
- Framework: Express
- Database: MongoDB (Mongoose)
- Auth: JWT-based authentication and role-based access control

This repository provides a simple structure for user and course management including validation, middleware, and authentication.

---

## Repository Layout

- `src/server.ts` — application entry
- `src/configs/` — env, db, redis configuration helpers
- `src/routes/` — Express routes (`user.route.ts`, `course.route.ts`)
- `src/controllers/` — route handlers
- `src/models/` — Mongoose schemas/models
- `src/middlewares/` — authentication, role-based access, validation

---

## Quick Start

Prerequisites:

- Node.js v18+ and npm
- MongoDB (local or Atlas)

Install dependencies:

```bash
npm install
```

Create a `.env` file (copy from provided example if any) and set at least:

- `PORT` — server port (defaults to 4000 in code)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `NODE_ENV` — environment (development/production)

Run in development:

```bash
npm run dev
```

Build and run (production):

```bash
npm run build
npm start
```

Docker (simple):

The included `dockerfile` expects a built `dist/` folder. Build locally first, then build the image:

```bash
npm run build
docker build -t courset-api .
docker run -p 3000:3000 --env-file .env courset-api
```

---

## API Overview

Base path: `/api/v1`

Common endpoints (reference `src/routes/` for full details):

- `POST /api/v1/users` — register user
- `POST /api/v1/users/login` — login and receive JWT
- `GET /api/v1/courses` — list courses
- `POST /api/v1/courses` — create course (protected)

Example curl (register):

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

---

## Important files

- `src/configs/env.config.ts` — centralizes env variables
- `src/configs/db.config.ts` — mongoose connection helper
- `src/server.ts` — app bootstrap and route wiring

---

## Scripts

- `npm run dev` — run in watch mode (`tsx`)
- `npm run build` — compile TypeScript
- `npm start` — run compiled output
- `npm test` — run tests with Jest

---

## Testing

Tests use Jest. Test convention: `**/__tests__/**/*.test.ts`.

```bash
npm test
```

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Add tests and update types where applicable
4. Open a PR with a clear description

---

## LLM Agent Prompt (optional)

Use this prompt when asking an LLM to work on this repository:

"You are an experienced TypeScript backend engineer with full repository access. The repo contains `src/` (Express server, routes, controllers, models, middlewares), `tsconfig.json`, `package.json`, and a `dockerfile`.

Goals:

- Make minimal, well-tested changes and prefer small focused commits.
- Preserve file layout and public APIs unless explicitly asked to refactor.
- Run `npm run build` and `npm test` after edits; fix only issues introduced by your changes.

When implementing work:

1. Provide a short actionable plan and record it in a TODO list.
2. Modify only the files required for the task.
3. Run the TypeScript compiler and tests; if tests fail, fix failures caused by your changes only.
4. Return a concise summary of edits with file links and commands to reproduce.

Constraints:

- Never expose secrets; replace any real secrets with placeholders.
- Do not upgrade major dependencies without justification.
  "

---

If you want, I can commit this README for you, add an OpenAPI spec, or generate example Postman requests next.
