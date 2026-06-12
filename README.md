# TaskFlow — Team Task Progress Management System

A production-style MERN application for tracking team task progress: live KPIs,
status analytics, per-employee reporting, role-based access, and Excel/PDF/print
exports — wrapped in a polished, fully theme-able (dark/light) enterprise UI.

- **Frontend:** React 18 · Vite · Tailwind CSS · Recharts · Framer Motion
- **Backend:** Node.js · Express · MongoDB (Mongoose)
- **Auth:** JWT with `Admin` / `Manager` / `Employee` roles
- **Extras:** Excel + PDF + print export, Docker support, seed data

---

## Table of contents

1. [Project structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Quick start (local)](#quick-start-local)
4. [Quick start (Docker)](#quick-start-docker)
5. [Demo accounts](#demo-accounts)
6. [Environment variables](#environment-variables)
7. [API reference](#api-reference)
8. [Data model](#data-model)
9. [Roles & permissions](#roles--permissions)
10. [Notes & next steps](#notes--next-steps)

---

## Project structure

```
team-task-system/
├── backend/
│   ├── server.js                 # Entrypoint — connects DB, starts server
│   ├── src/
│   │   ├── app.js                # Express app + middleware wiring
│   │   ├── config/               # DB connection, shared constants
│   │   ├── models/               # User, Employee, Task (Mongoose)
│   │   ├── middleware/           # JWT auth, role guard, error handler
│   │   ├── controllers/          # auth, employee, task, dashboard
│   │   ├── routes/               # REST route definitions
│   │   └── utils/seed.js         # Seed users + employees + sample tasks
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios client w/ token interceptor
│   │   ├── context/              # Auth + Theme providers
│   │   ├── components/           # Sidebar, Layout, charts, modals, etc.
│   │   ├── pages/                # Login, Dashboard, EmployeeRecords
│   │   ├── utils/                # constants, exporters (xlsx/pdf)
│   │   ├── App.jsx               # Router + protected routes
│   │   └── index.css             # Theme tokens + base styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml            # Mongo + backend + frontend
└── .env.example
```

---

## Prerequisites

- **Node.js 18+** and npm
- **MongoDB 6/7** running locally, *or* a MongoDB Atlas connection string
- (Optional) **Docker + Docker Compose** for the containerized path

---

## Quick start (local)

### 1. Backend

```bash
cd backend
cp .env.example .env          # then edit values (see below)
npm install
npm run seed                  # creates demo users, employees & sample tasks
npm run dev                   # starts API on http://localhost:5000
```

You should see `✓ MongoDB connected` and `✓ API server running on http://localhost:5000`.

> Sanity check: open <http://localhost:5000/api/health> — it should return `{ "status": "ok" }`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env          # leave VITE_API_URL blank to use the dev proxy
npm install
npm run dev                   # starts UI on http://localhost:5173
```

Open <http://localhost:5173> and sign in with a [demo account](#demo-accounts).

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so no CORS setup
is needed in development.

---

## Quick start (Docker)

Brings up MongoDB, the API, and the built frontend (served by nginx) together.

```bash
# from the project root
cp .env.example .env          # set a strong JWT_SECRET
docker compose up --build
```

| Service   | URL                     |
| --------- | ----------------------- |
| Frontend  | http://localhost:8080   |
| Backend   | http://localhost:5000   |
| MongoDB   | mongodb://localhost:27017 |

Seed data inside the running backend container:

```bash
docker compose exec backend npm run seed
```

---

## Demo accounts

Created by `npm run seed`:

| Role     | Email                   | Password      |
| -------- | ----------------------- | ------------- |
| Admin    | `admin@taskflow.dev`    | `admin123`    |
| Manager  | `manager@taskflow.dev`  | `manager123`  |
| Employee | `employee@taskflow.dev` | `employee123` |

The login page has one-tap buttons that pre-fill each set of credentials.

---

## Environment variables

### `backend/.env`

| Variable        | Default                                          | Description                          |
| --------------- | ------------------------------------------------ | ------------------------------------ |
| `PORT`          | `5000`                                           | API port                             |
| `NODE_ENV`      | `development`                                    | Hides stack traces when `production` |
| `MONGO_URI`     | `mongodb+srv://user:password@cluster.mongodb.net/Team_Tasks?retryWrites=true&w=majority`     | MongoDB connection string            |
| `JWT_SECRET`    | `change-me-in-production`                         | **Set a long random value**          |
| `JWT_EXPIRES_IN`| `7d`                                             | Token lifetime                       |
| `CLIENT_URL`    | `http://localhost:5173`                          | Allowed CORS origin                  |

### `frontend/.env`

| Variable       | Default | Description                                                  |
| -------------- | ------- | ------------------------------------------------------------ |
| `VITE_API_URL` | *(empty)* | API base URL. Leave blank in dev to use the Vite proxy; set to your deployed API URL in production (e.g. `https://api.example.com/api`). |

---

## API reference

Base path: `/api`. All routes except `auth` require an
`Authorization: Bearer <token>` header. Write routes are role-restricted
(see [Roles & permissions](#roles--permissions)).

### Auth

| Method | Endpoint         | Body                              | Description              |
| ------ | ---------------- | --------------------------------- | ------------------------ |
| POST   | `/auth/register` | `{ name, email, password, role }` | Create an account        |
| POST   | `/auth/login`    | `{ email, password }`             | Returns `{ user, token }`|
| GET    | `/auth/me`       | —                                 | Current user (protected) |

### Employees

| Method | Endpoint         | Roles            | Description                         |
| ------ | ---------------- | ---------------- | ----------------------------------- |
| GET    | `/employees`     | any              | List; `?search=&department=` filter |
| POST   | `/employees`     | Admin, Manager   | Create employee                     |
| PUT    | `/employees/:id` | Admin, Manager   | Update (syncs denormalized tasks)   |
| DELETE | `/employees/:id` | Admin            | Delete employee + their tasks       |

### Tasks

| Method | Endpoint                       | Roles          | Description                                  |
| ------ | ------------------------------ | -------------- | -------------------------------------------- |
| GET    | `/tasks`                       | any            | List with filtering, pagination, sorting     |
| GET    | `/tasks/employee/:employeeId`  | any            | Tasks for one employee                       |
| POST   | `/tasks`                       | Admin, Manager | Create — accepts a **single task or array**  |
| PUT    | `/tasks/:id`                   | Admin, Manager | Update a task                                |
| DELETE | `/tasks/:id`                   | Admin, Manager | Delete a task                                |

**`GET /tasks` query parameters**

| Param           | Example                       | Notes                              |
| --------------- | ----------------------------- | ---------------------------------- |
| `department`    | `IT`                          | Exact match                        |
| `status`        | `WIP`                         | `Not Yet Started` \| `WIP` \| `Completed` |
| `employeeNames` | `Ankit Kumar,Vidya`           | Comma-separated                    |
| `startDate`     | `2026-06-01`                  | Filters by `taskDate` ≥            |
| `endDate`       | `2026-06-30`                  | Filters by `taskDate` ≤            |
| `search`        | `api`                         | Matches title/description          |
| `page`,`limit`  | `1`, `10`                     | Pagination                         |
| `sortBy`,`order`| `createdAt`, `desc`           | Sorting                            |

Response shape:

```json
{
  "data": [ /* tasks */ ],
  "pagination": { "page": 1, "limit": 10, "total": 16, "pages": 2 }
}
```

### Dashboard

| Method | Endpoint             | Description                                          |
| ------ | -------------------- | ---------------------------------------------------- |
| GET    | `/dashboard/summary` | KPIs + datasets for all four charts. Accepts the same filter params as `GET /tasks`. |

```json
{
  "kpis": { "total": 16, "completed": 6, "wip": 5, "notStarted": 5, "overdue": 3 },
  "charts": {
    "statusDistribution": [ { "status": "Completed", "count": 6 } ],
    "employeeCounts":     [ { "employee": "Ankit Kumar", "total": 4, "completed": 2 } ],
    "departmentProgress": [ { "department": "IT", "total": 8, "completed": 3 } ],
    "completionTrend":    [ { "label": "Jun 2026", "completed": 4 } ]
  }
}
```

---

## Data model

**Employee**

```json
{ "_id": "ObjectId", "employeeName": "Ankit Kumar", "department": "IT", "createdAt": "Date" }
```

**Task** (employee name + department are denormalized for fast reporting)

```json
{
  "_id": "ObjectId",
  "employeeId": "ObjectId",
  "employeeName": "Ankit Kumar",
  "department": "IT",
  "taskTitle": "API Development",
  "taskDescription": "Develop task management APIs",
  "taskStatus": "WIP",
  "taskDate": "2026-06-04",
  "expectedCompletionDate": "2026-06-10",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

A task exposes a virtual `isOverdue` flag (not `Completed` and past its
`expectedCompletionDate`). KPIs and the report UI use this for the overdue count
and badge.

---

## Roles & permissions

| Capability                      | Admin | Manager | Employee |
| ------------------------------- | :---: | :-----: | :------: |
| View dashboard & reports        |   ✓   |    ✓    |    ✓     |
| Create / edit tasks             |   ✓   |    ✓    |    —     |
| Delete tasks                    |   ✓   |    ✓    |    —     |
| Create / edit employees         |   ✓   |    ✓    |    —     |
| Delete employees                |   ✓   |    —    |    —     |

The Employee Records page hides write actions and shows a "Read-only access"
badge for the `Employee` role; the API enforces the same rules server-side.

---

## Notes & next steps

- **Security:** always set a strong `JWT_SECRET` and a real `MONGO_URI` in
  production. Passwords are hashed with bcrypt; auth endpoints are rate-limited.
- **Bundle size:** the production build warns about chunk size because `xlsx`
  and `jspdf` are heavy. If it matters, lazy-load the exporters with dynamic
  `import()`.
- **Possible extensions:** server-side pagination in the UI tables, an Employees
  management screen (the API already supports full employee CRUD), audit logging,
  and email notifications.

---

Built as a complete, runnable scaffold — both `npm run build` (frontend) and the
API boot/auth/route checks pass out of the box.
