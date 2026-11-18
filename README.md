# InternSphere — REST API & Persistent Data Service

> Robust, high-performance, and secure RESTful API and persistent SQLite data service powering the **InternSphere Responsive Internship Board**. Built with **Node.js**, **Express.js**, **SQLite**, and **Vanilla ES6+**.

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [Database Initialization & Seeding](#-database-initialization--seeding)
- [Running the Server](#-running-the-server)
- [API Endpoints Catalog](#-api-endpoints-catalog)
- [Standard API Envelopes & Error Codes](#-standard-api-envelopes--error-codes)
- [Admin Authentication & Security](#-admin-authentication--security)
- [Automated Testing](#-automated-testing)
- [Dataset Comparison Guide](#-dataset-comparison-guide)
- [GitHub Publishing Instructions](#-github-publishing-instructions)

---

## 🌟 Project Overview

**InternSphere REST API** provides a persistent backend service for the Responsive Internship Board. It supports complete CRUD lifecycle operations for internship listings, advanced multi-parameter filtering, full-text search, pagination, application submission with duplicate prevention, and zero-PII logging.

The backend also seamlessly serves the responsive vanilla frontend from `/public` while supporting cross-origin requests (CORS) for external clients.

---

## 🚀 Key Features

1. **Persistent SQLite Database**:
   - High-throughput database using Node v24's native `node:sqlite` (`DatabaseSync`) engine with Write-Ahead Logging (WAL) and foreign keys enabled.
   - Preserves original IDs across datasets (numbers `'1'`..`'15'` and codes `'INT-101'`..`'INT-105'`).
2. **Complete RESTful Endpoints**:
   - List, search, filter, paginate, retrieve, create, update (PUT/PATCH), and delete internships.
3. **Advanced Filtering & Pagination**:
   - Search across title, company, skills, and description.
   - Filter by domain and work mode (Remote, Hybrid, On-site).
   - Six flexible sorting strategies (`featured`, `title-asc`, `title-desc`, `company-asc`, `duration-asc`, `duration-desc`).
   - Page and limit parameter validation with complete pagination metadata (`totalItems`, `totalPages`, `hasNextPage`, `hasPrevPage`).
4. **Application Submission & Validation**:
   - Robust input sanitization for applicant names, RFC 5322 emails, and portfolio URLs.
   - Duplicate prevention returning HTTP 409 Conflict.
   - Automatic application closure checks when positions are closed.
5. **Security & Privacy (Zero-PII Access Logs)**:
   - Helmet security headers with cross-origin policies.
   - Custom safe logger that masks emails (`n***i@domain.com`) and redacts applicant names, notes, and request bodies.
   - Admin-protected endpoints requiring `x-admin-key` authentication.
   - Standardized error responses that hide internal database stack traces in production.
6. **Resilient Frontend Integration**:
   - Connects live to the REST API with automatic fallback to static local data if the server is offline.

---

## 🛠 Technology Stack

- **Runtime**: Node.js (v20+ or v24+)
- **Framework**: Express.js 4.21+
- **Database Engine**: SQLite 3 (via native `node:sqlite` / `better-sqlite3`)
- **Security & Utilities**:
  - `helmet`: HTTP header security
  - `cors`: Cross-Origin Resource Sharing
  - `dotenv`: Environment configuration management
  - `morgan`: Request duration metrics & logging

---

## 📁 Project Structure

```text
internship-board-api/
│
├── package.json                   # Dependencies, npm scripts & metadata
├── .env.example                   # Environment configuration template
├── .env                           # Local environment secrets (excluded from git)
├── .gitignore                     # Git exclusion rules
├── README.md                      # Comprehensive project documentation
│
├── data/
│   ├── seed-frontend.json         # Dataset A: Primary 15 frontend records (IDs 1-15)
│   └── seed-api-sample.json       # Dataset B: Supplied 5 reference records (IDs INT-101..105)
│
├── database/
│   ├── schema.sql                 # Extended SQLite schema with indexes & FKs
│   ├── internships.db             # Persistent SQLite database file
│   ├── internships.db-shm         # SQLite shared memory index
│   └── internships.db-wal         # SQLite Write-Ahead Log
│
├── public/                        # Static frontend web application
│   ├── index.html                 # Semantic HTML5 accessible client
│   ├── css/
│   │   └── style.css              # Responsive vanilla CSS3 stylesheets
│   ├── js/
│   │   └── app.js                 # Vanilla ES6+ client logic with REST API connectivity
│   └── data/
│       └── internships.json       # Offline fallback dataset
│
├── src/
│   ├── server.js                  # Server entry point & graceful shutdown handler
│   ├── app.js                     # Express app configuration & middleware pipeline
│   │
│   ├── config/
│   │   ├── db.js                  # Database connection singleton & schema runner
│   │   └── env.js                 # Environment variable validation & exports
│   │
│   ├── database/
│   │   ├── migrate.js             # Table migration & schema verification runner
│   │   └── seed.js                # Repeatable, idempotent database seeder
│   │
│   ├── controllers/
│   │   ├── internships.controller.js  # Internships CRUD controller
│   │   └── applications.controller.js # Application submission & listing controller
│   │
│   ├── services/
│   │   ├── internships.service.js     # SQL query builder, search & pagination logic
│   │   └── applications.service.js    # Application workflows & duplicate checking
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js         # Admin API key authentication (x-admin-key)
│   │   ├── error.middleware.js        # Global safe error handling middleware
│   │   ├── safe-logger.middleware.js  # Zero-PII request logging middleware
│   │   └── validate.middleware.js     # Request payload & pagination validators
│   │
│   ├── routes/
│   │   ├── index.js                   # Main API router (/api/v1)
│   │   ├── health.routes.js           # Health check endpoints
│   │   ├── internships.routes.js      # Internships CRUD routes
│   │   ├── applications.routes.js     # Application submission & admin routes
│   │   └── domains.routes.js          # Domain aggregation route
│   │
│   └── utils/
│       ├── envelope.js                # Consistent API response envelope wrappers
│       └── pii-masker.js              # Masking utility for emails & applicant data
│
├── tests/
│   ├── test-runner.js                 # Master test orchestrator
│   ├── run-all-tests.js               # 25 Core API & persistence tests
│   ├── frontend-integration.test.js   # Client asset delivery & workflow tests
│   ├── security-and-logging.test.js   # PII masking & auth security tests
│   └── health.test.js                 # Basic health smoke test
│
└── docs/
    ├── API_EXAMPLES.md                # Runnable curl examples for every endpoint
    └── TEST_REPORT.md                 # Formal QA test execution report (100% pass)
```

---

## ⚙️ Prerequisites

- **Node.js**: v20.0.0 or higher (v24.20.0 recommended)
- **npm**: v10.0.0 or higher (v11.19.0 tested)
- A modern web browser (Chrome, Firefox, Safari, Edge)

---

## 📥 Installation & Setup

1. **Clone or Navigate to the Project Directory**:
   ```bash
   cd internship-board-api
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

---

## 🔧 Environment Configuration

Edit the `.env` file to configure your local preferences:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port on which the Express server listens |
| `NODE_ENV` | `development` | Environment mode (`development` or `production`) |
| `DB_PATH` | `database/internships.db` | Relative or absolute path to SQLite file |
| `ADMIN_API_KEY` | `adminkey_supersecret_internsphere_2026` | Secret key for administrative application endpoints |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (e.g. `http://localhost:3000` or `*`) |

---

## 🗄 Database Initialization & Seeding

The database auto-initializes upon server startup. You can also run migrations or seeds manually:

### 1. Verify Database Schema:
```bash
npm run migrate
```

### 2. Seed Primary Frontend Dataset (Dataset A - 15 records, IDs 1 to 15):
```bash
npm run seed:frontend
```

### 3. Seed Reference API Dataset (Dataset B - 5 records, IDs INT-101 to INT-105):
```bash
npm run seed:api
```

### 4. Seed All Datasets Simultaneously:
```bash
npm run seed
```

---

## 🚀 Running the Server

### Development Mode (with file watching):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Once started:
- **Web Application**: Open [http://localhost:5000/](http://localhost:5000/) in your browser.
- **API Health**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
- **API Internships**: [http://localhost:5000/api/v1/internships](http://localhost:5000/api/v1/internships)

---

## 📡 API Endpoints Catalog

All endpoints are prefixed with `/api/v1`.

| HTTP Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/health` | Public | System diagnostic & database connectivity status |
| `GET` | `/api/v1/internships` | Public | List internships (search, domain, mode, sort, pagination) |
| `GET` | `/api/v1/internships/:id` | Public | Retrieve detailed profile for single internship |
| `POST` | `/api/v1/internships` | Public | Create new internship opportunity |
| `PUT` | `/api/v1/internships/:id` | Public | Full update of existing internship |
| `PATCH` | `/api/v1/internships/:id` | Public | Partial update of internship fields |
| `DELETE` | `/api/v1/internships/:id` | Public | Delete an internship position |
| `GET` | `/api/v1/domains` | Public | Category aggregation with role counts |
| `POST` | `/api/v1/applications` | Public | Submit applicant profile (duplicate prevented) |
| `GET` | `/api/v1/applications` | **Admin** | List submitted candidate applications |
| `GET` | `/api/v1/applications/:id` | **Admin** | Retrieve single application details |

*Detailed curl examples for every endpoint are available in [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md).*

---

## 📦 Standard API Envelopes & Error Codes

### Success Envelope (Single Entity):
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Success Envelope (Paginated Collection):
```json
{
  "status": "success",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 20,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "Retrieved 10 internship positions."
}
```

### Error Envelope:
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "applicant_email",
      "message": "A valid email address is required."
    }
  ]
}
```

### HTTP Status Codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or application to a closed role.
- `401 Unauthorized`: Missing or invalid `x-admin-key`.
- `404 Not Found`: Requested ID does not exist.
- `409 Conflict`: Duplicate application or duplicate ID.
- `500 Internal Server Error`: Unhandled server exception.

---

## 🔐 Admin Authentication & Security

Administrative endpoints (`GET /api/v1/applications` and `GET /api/v1/applications/:id`) are strictly protected from public access.

### Supplying the Admin Key:
Pass the secret key using the `x-admin-key` header (or `Authorization: Bearer <key>`):

```bash
curl -X GET "http://localhost:5000/api/v1/applications" \
  -H "x-admin-key: adminkey_supersecret_internsphere_2026"
```

Requests without this header return:
```json
{
  "status": "error",
  "message": "Unauthorized: Valid admin API key required in 'x-admin-key' header."
}
```

### Zero-PII Log Protection:
Access logs never print applicant names, notes, raw request bodies, or full emails. Emails are automatically masked in console outputs (`a***n@example.com`).

---

## 🧪 Automated Testing

Execute the comprehensive automated test suite across all 25 criteria:

```bash
npm test
```

### Test Suites Included:
1. **`tests/run-all-tests.js`**: Core 25 functional, CRUD, search, filter, pagination, error, duplicate prevention, and persistence tests.
2. **`tests/frontend-integration.test.js`**: Client asset serving, CORS header validation, and end-to-end application submission.
3. **`tests/security-and-logging.test.js`**: Log sanitization, email masking, and admin authorization verification.

*For detailed test results and edge-case reports, see [docs/TEST_REPORT.md](docs/TEST_REPORT.md).*

---

## 📊 Dataset Comparison Guide

| Attribute | Dataset A (`seed-frontend.json`) | Dataset B (`seed-api-sample.json`) |
| :--- | :--- | :--- |
| **Purpose** | Primary dataset for the responsive frontend | Reference/sample dataset from task brief |
| **Record Count** | 15 records | 5 records |
| **ID Format** | Integer IDs `1` to `15` | String code IDs `INT-101` to `INT-105` |
| **Domains Covered** | 8 technology domains | 4 technology domains |
| **Work Mode Field** | `locationType` ("Remote", "Hybrid", "On-site") | `mode` ("Remote", "Hybrid", "On-site") |
| **Rich Metadata** | `company`, `duration`, `stipend`, `postedDate`, `description`, `featured` | Lean schema: `title`, `domain`, `mode`, `location`, `skills`, `openings` |
| **SQLite Mapping** | Stored with full attributes | Stored with defaults for missing attributes (`Undisclosed` company) |

Both datasets are preserved separately in `data/` and can be seeded independently without data loss.

---

## 🚀 GitHub Publishing Instructions

To publish this standalone repository to GitHub under username **Neeraj0118**:

```bash
# 1. Initialize Git repository
git init

# 2. Add all files (respecting .gitignore)
git add .

# 3. Create initial commit
git commit -m "feat: complete Task 03 REST API and persistent SQLite data service"

# 4. Set main branch
git branch -M main

# 5. Link to your GitHub repository
git remote add origin https://github.com/Neeraj0118/internship-board-api.git

# 6. Push to remote
git push -u origin main
```

---

## 📄 License
ISC License © 2026 Neeraj Giri (Neeraj0118)
