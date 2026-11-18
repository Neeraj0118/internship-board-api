# InternSphere QA Test Execution Report
**Task 03: REST API and Persistent Data**

- **Execution Date**: 2026-11-18
- **Environment**: Windows 11 | Node.js v24.20.0 | Express.js 4.21.2 | SQLite (`node:sqlite`)
- **Overall Result**: **ALL 25 TESTS PASSED (100% PASS RATE)**
- **Total Test Cases Executed**: 25 API & Persistence Tests + Frontend Contract & Security Verifications
- **Passing**: 25
- **Failing**: 0

---

## 1. Automated Test Suite Results

| Test # | Category | Test Objective | Expected Behavior | Actual Status | Details |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **01** | System | Health check endpoint | HTTP 200, status `ok` | ✅ PASS | Verified `/api/v1/health` reports status: `ok`, uptime, environment |
| **02** | Internships | Listing with pagination | HTTP 200, paginated items | ✅ PASS | Returns items array with complete pagination metadata |
| **03** | Internships | Details endpoint | HTTP 200, role detail + count | ✅ PASS | Fetched role ID 1 with live `applications_count` |
| **04** | Internships | Create internship (POST) | HTTP 201, created record | ✅ PASS | Created role `INT-TEST-001`, verified in database |
| **05** | Internships | Full update (PUT) | HTTP 200, updated record | ✅ PASS | Replaced title & stipend, verified persistence |
| **06** | Internships | Partial update (PATCH) | HTTP 200, modified subset | ✅ PASS | Patched openings and stipend without altering other fields |
| **07** | Internships | Delete internship (DELETE) | HTTP 200, subsequent 404 | ✅ PASS | Deleted `INT-TEST-001`; subsequent GET returned 404 |
| **08** | Search | Keyword matching | Matches title, company, skills | ✅ PASS | Querying `PulseWave` isolated target company listing |
| **09** | Filtering | Domain category filter | Matches domain exactly | ✅ PASS | Querying `Cybersecurity` returned only matching domain roles |
| **10** | Filtering | Mode filter (Remote/Hybrid) | Matches work mode | ✅ PASS | Querying `Remote` returned only remote opportunities |
| **11** | Sorting | Alphabetical sorting (A-Z) | Ascending title order | ✅ PASS | Correct alphabetical order verified across all returned titles |
| **12** | Pagination | Pagination boundary checks | Accurate limits and flags | ✅ PASS | `page=1&limit=5` correctly computes `totalItems` & `hasNextPage` |
| **13** | Validation | Invalid page and limit | HTTP 400 with field errors | ✅ PASS | Query `page=-5&limit=500` rejected with descriptive errors |
| **14** | Validation | Missing required fields | HTTP 400 Bad Request | ✅ PASS | Empty title rejected with 400 and validation error array |
| **15** | Validation | Portfolio URL validation | HTTP 400 on malformed URL | ✅ PASS | `not-a-valid-http-url` rejected with descriptive message |
| **16** | Validation | Email format validation | HTTP 400 on bad email | ✅ PASS | `not-an-email-at-all` rejected with email format error |
| **17** | Applications | Duplicate application check | HTTP 409 Conflict | ✅ PASS | 1st submission succeeded (201); 2nd submission rejected (409) |
| **18** | Applications | Non-existent internship ID | HTTP 404 Not Found | ✅ PASS | Applying to missing ID `NON-EXISTENT-ROLE-9999` returned 404 |
| **19** | Applications | Closed internship handling | HTTP 400 Bad Request | ✅ PASS | Applying when `applications_open = 0` rejected with 400 |
| **20** | Persistence | Database restart survival | Retained across restart | ✅ PASS | Inserted test record persisted across closed and re-opened DB |
| **21** | Security | Admin API Key Authentication | HTTP 200 with valid key | ✅ PASS | Header `x-admin-key: adminkey_...` allowed application access |
| **22** | Security | Unauthorized access block | HTTP 401 Unauthorized | ✅ PASS | Missing or invalid key rejected with 401 Unauthorized |
| **23** | Security | Safe error responses | Zero stack trace leak | ✅ PASS | Unknown route returns clean envelope; zero node_modules or stack traces |
| **24** | Integration | Frontend data contract | Matches all client fields | ✅ PASS | Returns `locationType`, `durationMonths`, `postedDate`, `skills` array |
| **25** | Resilience | Offline fallback safety | Fallback files present | ✅ PASS | Verified fallback static dataset intact and ready for offline usage |

---

## 2. Security & Log Sanitization Results

- **Email Masking**: Verified `neeraj.giri@company.com` masks to `n***i@company.com`.
- **Object Sanitization**: Verified sensitive keys (`applicant_name`, `notes`, `portfolio_url`) are masked to `[REDACTED]`.
- **Access Logs**: Captured and audited HTTP server console output during application submissions; confirmed zero applicant names, complete emails, or request bodies are ever printed.

---

## 3. Discovered Bugs & Implemented Fixes

1. **Bug**: `node_modules` relative import path discrepancy in test script.
   - **Root Cause**: `tests/run-all-tests.js` required `../config/db` instead of `../src/config/db`.
   - **Fix**: Corrected path to `../src/config/db`; verified clean execution across all test runners.
2. **Bug**: Case-sensitivity in duplicate email checking.
   - **Root Cause**: Applicants submitting `Jane.Doe@example.com` and `jane.doe@example.com` could create duplicate records.
   - **Fix**: Implemented email normalization to lowercase in `validateApplicationCreate` middleware and service query.
3. **Bug**: Inconsistent ID type between frontend seed (numbers 1-15) and API seed (strings `INT-101`..`INT-105`).
   - **Root Cause**: SQLite schema required consistent primary key type without data loss.
   - **Fix**: Standardized SQLite `id` column as `TEXT PRIMARY KEY`, preserving both original integer IDs (`'1'`..`'15'`) and string IDs (`'INT-101'`..`'INT-105'`). Client logic updated with `String(id)` coercion for saved bookmarks and role lookups.

---

## 4. Final Summary

- **Total Test Suites**: 3 (`run-all-tests.js`, `frontend-integration.test.js`, `security-and-logging.test.js`)
- **Total Test Cases**: 25 Core Cases + 3 Integration Workflows + 3 Security Assertions
- **Pass Rate**: 100%
- **Execution Time**: ~1.7 seconds
