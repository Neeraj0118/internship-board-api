-- Production SQLite Schema for InternSphere Internship Board API
PRAGMA foreign_keys = ON;

-- 1. Internships Table
CREATE TABLE IF NOT EXISTS internships (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL DEFAULT 'Undisclosed',
    domain TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT 'Remote',
    mode TEXT NOT NULL,
    duration TEXT DEFAULT 'Flexible',
    duration_months INTEGER DEFAULT 3,
    stipend TEXT DEFAULT 'Unpaid',
    posted_date TEXT DEFAULT 'Recently',
    description TEXT DEFAULT '',
    skills TEXT NOT NULL DEFAULT '[]',
    openings INTEGER NOT NULL DEFAULT 1,
    applications_open INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_internships_domain ON internships(domain);
CREATE INDEX IF NOT EXISTS idx_internships_mode ON internships(mode);
CREATE INDEX IF NOT EXISTS idx_internships_featured ON internships(featured DESC);
CREATE INDEX IF NOT EXISTS idx_internships_created_at ON internships(created_at DESC);

-- 2. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_id TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    portfolio_url TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (internship_id, applicant_email),
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
);

-- Application Indexes
CREATE INDEX IF NOT EXISTS idx_applications_internship_id ON applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(applicant_email);
