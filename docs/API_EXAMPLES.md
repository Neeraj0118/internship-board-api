# InternSphere REST API — Endpoints & cURL Reference Guide

Comprehensive documentation with copy-paste runnable `curl` examples for every endpoint supported by the **InternSphere REST API**.

- **Base URL**: `http://localhost:5000/api/v1`
- **Default Port**: `5000` (configurable via `PORT` in `.env`)
- **Admin API Key**: Configured in `.env` as `ADMIN_API_KEY` (default: `adminkey_supersecret_internsphere_2026`)

---

## 1. System Health & Diagnostics

### `GET /api/v1/health`
Checks backend service availability, node version, uptime, and database status.

```bash
curl -X GET http://localhost:5000/api/v1/health \
  -H "Accept: application/json"
```

#### Sample Response (HTTP 200 OK):
```json
{
  "status": "success",
  "data": {
    "service": "internship-board-api",
    "status": "ok",
    "timestamp": "2026-11-18T12:35:00.000Z",
    "uptimeSeconds": 142,
    "environment": "development",
    "nodeVersion": "v24.20.0"
  },
  "message": "InternSphere API service is healthy and operating normally."
}
```

---

## 2. Internships Endpoints

### `GET /api/v1/internships`
List internships with full multi-dimensional filtering, searching, sorting, and pagination.

#### A. Basic List (Default Pagination: Page 1, Limit 10)
```bash
curl -X GET "http://localhost:5000/api/v1/internships" \
  -H "Accept: application/json"
```

#### B. Search Keyword (matches title, company, skills, description)
```bash
curl -X GET "http://localhost:5000/api/v1/internships?search=frontend" \
  -H "Accept: application/json"
```

#### C. Filter by Domain & Work Mode
```bash
curl -X GET "http://localhost:5000/api/v1/internships?domain=Data%20Science%20%26%20AI&mode=Remote" \
  -H "Accept: application/json"
```

#### D. Sort Alphabetically (A to Z) with Custom Page Limit
```bash
curl -X GET "http://localhost:5000/api/v1/internships?sort=title-asc&page=1&limit=5" \
  -H "Accept: application/json"
```

#### Supported Sort Parameters:
- `featured` (default): Featured listings first, then newly added
- `title-asc`: Title alphabetically A to Z
- `title-desc`: Title Z to A
- `company-asc`: Company alphabetically A to Z
- `duration-asc`: Shortest duration first
- `duration-desc`: Longest duration first

#### Sample Response (HTTP 200 OK):
```json
{
  "status": "success",
  "data": [
    {
      "id": "1",
      "title": "Frontend Engineer Intern",
      "company": "PulseWave Technologies",
      "domain": "Frontend Engineering",
      "location": "Remote, US",
      "mode": "Remote",
      "locationType": "Remote",
      "duration": "3 Months",
      "duration_months": 3,
      "durationMonths": 3,
      "stipend": "$3,800/month",
      "posted_date": "2 days ago",
      "postedDate": "2 days ago",
      "description": "Collaborate with senior designers and engineers to build performant, accessible web user interfaces.",
      "skills": ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Accessibility"],
      "openings": 2,
      "applications_open": true,
      "featured": true,
      "created_at": "2026-11-18T10:00:00.000Z",
      "updated_at": "2026-11-18T10:00:00.000Z"
    }
  ],
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

---

### `GET /api/v1/internships/:id`
Retrieve detailed profile for a specific internship, including live applicant counts.

```bash
curl -X GET http://localhost:5000/api/v1/internships/1 \
  -H "Accept: application/json"
```

#### Sample Response (HTTP 200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "1",
    "title": "Frontend Engineer Intern",
    "company": "PulseWave Technologies",
    "domain": "Frontend Engineering",
    "location": "Remote, US",
    "mode": "Remote",
    "duration": "3 Months",
    "duration_months": 3,
    "stipend": "$3,800/month",
    "description": "Collaborate with senior designers...",
    "skills": ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Accessibility"],
    "openings": 2,
    "applications_open": true,
    "featured": true,
    "applications_count": 4,
    "created_at": "2026-11-18T10:00:00.000Z",
    "updated_at": "2026-11-18T10:00:00.000Z"
  },
  "message": "Internship retrieved successfully."
}
```

---

### `POST /api/v1/internships`
Create a new internship listing with schema validation.

```bash
curl -X POST http://localhost:5000/api/v1/internships \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Cloud Intern",
    "company": "Aether Dynamics",
    "domain": "Cloud & DevOps",
    "location": "Seattle, WA",
    "mode": "Hybrid",
    "duration": "6 Months",
    "duration_months": 6,
    "stipend": "$4,200/month",
    "description": "Develop scalable serverless functions and containerized microservices in AWS.",
    "skills": ["TypeScript", "AWS", "Docker", "Node.js"],
    "openings": 3,
    "applications_open": true,
    "featured": true
  }'
```

#### Sample Response (HTTP 201 Created):
```json
{
  "status": "success",
  "data": {
    "id": "INT-4821",
    "title": "Full Stack Cloud Intern",
    "company": "Aether Dynamics",
    "domain": "Cloud & DevOps",
    "location": "Seattle, WA",
    "mode": "Hybrid",
    "openings": 3,
    "applications_open": true,
    "featured": true,
    "created_at": "2026-11-18T12:40:00.000Z"
  },
  "message": "Internship position created successfully."
}
```

---

### `PUT /api/v1/internships/:id`
Complete replacement / full update of an existing internship.

```bash
curl -X PUT http://localhost:5000/api/v1/internships/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lead Frontend Engineer Intern",
    "company": "PulseWave Technologies",
    "domain": "Frontend Engineering",
    "location": "Remote, US",
    "mode": "Remote",
    "duration": "4 Months",
    "duration_months": 4,
    "stipend": "$4,200/month",
    "description": "Lead design system web components using vanilla ES6 and modern CSS architecture.",
    "skills": ["HTML5", "CSS3", "JavaScript", "Web Components"],
    "openings": 4,
    "applications_open": true,
    "featured": true
  }'
```

#### Sample Response (HTTP 200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "1",
    "title": "Lead Frontend Engineer Intern",
    "stipend": "$4,200/month",
    "openings": 4
  },
  "message": "Internship updated successfully."
}
```

---

### `PATCH /api/v1/internships/:id`
Partial update (e.g., closing applications or updating available openings).

```bash
curl -X PATCH http://localhost:5000/api/v1/internships/1 \
  -H "Content-Type: application/json" \
  -d '{
    "applications_open": false,
    "openings": 0
  }'
```

#### Sample Response (HTTP 200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "1",
    "applications_open": false,
    "openings": 0
  },
  "message": "Internship updated successfully."
}
```

---

### `DELETE /api/v1/internships/:id`
Delete an internship position (cascading any associated applications).

```bash
curl -X DELETE http://localhost:5000/api/v1/internships/INT-4821 \
  -H "Accept: application/json"
```

#### Sample Response (HTTP 200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "INT-4821"
  },
  "message": "Internship 'INT-4821' and associated applications deleted successfully."
}
```

---

## 3. Domains Aggregation

### `GET /api/v1/domains`
Returns available categories and active listing counts (used to populate frontend filter pills/dropdown).

```bash
curl -X GET http://localhost:5000/api/v1/domains \
  -H "Accept: application/json"
```

#### Sample Response (HTTP 200 OK):
```json
{
  "status": "success",
  "data": [
    { "domain": "Backend Systems", "count": 3 },
    { "domain": "Cloud & DevOps", "count": 2 },
    { "domain": "Cybersecurity", "count": 3 },
    { "domain": "Data Science & AI", "count": 3 },
    { "domain": "Frontend Engineering", "count": 3 },
    { "domain": "Mobile Development", "count": 2 },
    { "domain": "Product Management", "count": 2 },
    { "domain": "UI/UX Design", "count": 2 }
  ],
  "message": "Domains list retrieved successfully."
}
```

---

## 4. Applications Endpoints

### `POST /api/v1/applications` (Public)
Submit an application with name and email validation, and duplicate submission prevention.

```bash
curl -X POST http://localhost:5000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "internship_id": "1",
    "applicant_name": "Samantha Wright",
    "applicant_email": "samantha.wright@techuniv.edu",
    "portfolio_url": "https://github.com/swright-dev",
    "notes": "Eager to contribute to accessible UI design systems."
  }'
```

#### Sample Response (HTTP 201 Created):
```json
{
  "status": "success",
  "data": {
    "id": 12,
    "internship_id": "1",
    "applicant_name": "Samantha Wright",
    "applicant_email": "samantha.wright@techuniv.edu",
    "portfolio_url": "https://github.com/swright-dev",
    "notes": "Eager to contribute to accessible UI design systems.",
    "status": "pending",
    "created_at": "2026-11-18T12:45:00.000Z",
    "internship_title": "Frontend Engineer Intern",
    "internship_company": "PulseWave Technologies"
  },
  "message": "Application submitted successfully. We will review your profile shortly!"
}
```

#### Duplicate Submission (HTTP 409 Conflict):
Submitting the same email for the same role triggers duplicate prevention:
```json
{
  "status": "error",
  "message": "You have already submitted an application for this internship position."
}
```

---

### `GET /api/v1/applications` (Admin Protected)
List candidate applications. Requires `x-admin-key` header matching `ADMIN_API_KEY`.

#### A. List All Applications with Admin Key
```bash
curl -X GET "http://localhost:5000/api/v1/applications?page=1&limit=10" \
  -H "x-admin-key: adminkey_supersecret_internsphere_2026" \
  -H "Accept: application/json"
```

#### B. Filter Applications by Specific Internship Role
```bash
curl -X GET "http://localhost:5000/api/v1/applications?internship_id=1" \
  -H "x-admin-key: adminkey_supersecret_internsphere_2026" \
  -H "Accept: application/json"
```

#### Unauthorized Response (Missing or Invalid Key - HTTP 401 Unauthorized):
```json
{
  "status": "error",
  "message": "Unauthorized: Valid admin API key required in 'x-admin-key' header."
}
```

---

### `GET /api/v1/applications/:id` (Admin Protected)
Retrieve detailed profile for a specific application.

```bash
curl -X GET http://localhost:5000/api/v1/applications/12 \
  -H "x-admin-key: adminkey_supersecret_internsphere_2026" \
  -H "Accept: application/json"
```

#### Sample Response (HTTP 200 OK):
```json
{
  "status": "success",
  "data": {
    "id": 12,
    "internship_id": "1",
    "applicant_name": "Samantha Wright",
    "applicant_email": "samantha.wright@techuniv.edu",
    "portfolio_url": "https://github.com/swright-dev",
    "notes": "Eager to contribute to accessible UI design systems.",
    "status": "pending",
    "created_at": "2026-11-18T12:45:00.000Z",
    "internship_title": "Frontend Engineer Intern",
    "internship_company": "PulseWave Technologies"
  },
  "message": "Application retrieved successfully."
}
```
