# 🎓 College Student Leave Management System

A production-quality, full-stack **Student Leave Management System** built with **React 18 + Vite**, **Express.js**, **MySQL**, and **Tailwind CSS**.

Designed for seamless communication between students and academic heads (HODs) with real-time status tracking, parameterized SQL security, role-based JWT authentication, and interactive dashboards.

---

## 🌟 Features

### 👨‍🎓 Student Portal
- **Secure Authentication**: Registration and login with JWT and bcrypt password hashing.
- **Student Dashboard**: Live analytics (total applied, pending review, approved, rejected) and recent applications table.
- **Apply for Leave**: Comprehensive form with live duration calculation, date validation (start date $\le$ end date), and minimum character limits.
- **Leave History (`My Leaves`)**: Full pagination, color-coded status badges, rejection reason visibility, and details view.
- **Leave Cancellation**: One-click cancellation for pending applications with confirmation dialogs.
- **Student Profile**: Overview of student credentials, roll number, section, department, and semester.

### 👨‍🏫 HOD / Administrator Portal
- **Administrative Dashboard**: Real-time KPI cards and dedicated *Applications Requiring Review* feed.
- **Leave Applications Directory**: Multi-criteria server-side filtering:
  - Full-text search by student name or roll number
  - Filter by leave status (`Pending`, `Approved`, `Rejected`, `Cancelled`)
  - Filter by class section (`A`, `B`, `C`, `D`)
  - Filter by leave type (`Sick`, `Casual`, `Academic`, `Family`, `Other`)
  - Filter by custom date ranges
- **Two-Click Decision Workflow**:
  - Approve pending applications instantly.
  - Reject pending applications with mandatory feedback/reason logged to the database.
- **Application Detail Review**: Comprehensive student dossier and audit trail (applied at, reviewed at, reviewer identity).
- **Students Directory**: Centralized directory of all enrolled students with search and section filters.

### 🛡️ Security Architecture
- **Parameterized SQL Queries**: 100% of database queries use `?` parameter placeholders via `mysql2/promise` to prevent SQL injection.
- **Role-Based Access Control (RBAC)**: Strict separation between `student` and `hod` roles enforced on the Express backend via middleware.
- **Multi-Tenant Isolation**: Students can never view or cancel applications belonging to other students.
- **State Transition Safeguards**: Status progression is strictly controlled (`pending` $\rightarrow$ `approved` / `rejected` / `cancelled`). Re-approval or post-decision tampering is blocked with HTTP 400.
- **Stateless JWT**: Standard Authorization header bearer tokens with configurable expiration.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite | Single Page Application (SPA), React Router v7 |
| **Styling** | Tailwind CSS v4 | Curated color tokens, responsive breakpoints, accessible states |
| **Icons & UI** | React Icons, SVG | High-contrast, clean visual design |
| **Backend** | Node.js, Express.js | REST API architecture, express-validator |
| **Database** | MySQL 8.0 | Normalized relational schema with foreign keys and composite indexes |
| **Database Client** | `mysql2` | Promise-based connection pool with prepared statements |
| **Auth & Crypto** | `jsonwebtoken`, `bcryptjs` | 10 salt rounds for password hashing |

---

## 🏛️ System Architecture

```text
       ┌────────────────────────────┐
       │   React 18 + Vite (SPA)    │
       │   Tailwind CSS / Axios     │
       └──────────────┬─────────────┘
                      │ HTTP / REST (JWT Bearer)
                      ▼
       ┌────────────────────────────┐
       │   Express.js API Server    │
       │  (Routes, RBAC, Validator) │
       └──────────────┬─────────────┘
                      │ Parameterized SQL Queries (?)
                      ▼
       ┌────────────────────────────┐
       │      MySQL 8 Database      │
       │ users | students | leaves  │
       └────────────────────────────┘
```

---

## 📁 Directory Structure

```text
leaves_ms/
├── client/                          # Frontend React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Badge, Modal, Spinner, EmptyState, ProtectedRoute
│   │   │   └── layout/              # Header, Sidebar, AppLayout
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state & token persistence
│   │   ├── pages/
│   │   │   ├── auth/                # LoginPage, RegisterPage
│   │   │   ├── student/             # StudentDashboard, ApplyLeave, MyLeaves, LeaveDetail, Profile
│   │   │   └── hod/                 # HodDashboard, HodLeaveList, HodLeaveDetail, HodStudentList
│   │   ├── services/
│   │   │   └── api.js               # Axios instance & domain endpoints
│   │   ├── utils/                   # Helpers, constants, formatters
│   │   ├── App.jsx                  # Main application router
│   │   └── index.css                # Tailwind base & custom design tokens
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Backend Express Application
│   ├── src/
│   │   ├── controllers/             # authController, studentController, hodController
│   │   ├── routes/                  # authRoutes, studentRoutes, hodRoutes
│   │   ├── models/                  # userModel, studentModel, leaveModel (parameterized SQL)
│   │   ├── middleware/              # auth (JWT & RBAC), validate, errorHandler
│   │   ├── validators/              # express-validator schemas
│   │   ├── db/                      # connection pool setup
│   │   ├── utils/                   # response formatting
│   │   └── app.js                   # Express application setup
│   ├── server.js                    # Server startup entry point
│   ├── setup-db.js                  # Automated database creation & seeding script
│   └── package.json
│
├── database/
│   ├── schema.sql                   # DDL schema definition with FKs & indexes
│   └── seed.sql                     # Development seed records & demo users
│
├── .env                             # Active environment variables (gitignored)
├── .env.example                     # Environment template
├── package.json                     # Root workspace scripts
└── test-api.js                      # Automated 27-point verification test suite
```

---

## 📋 Prerequisites

Before starting, ensure you have installed:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher
- **MySQL Server**: v8.0 or higher running locally on port 3306

---

## ⚙️ Quick Start Installation

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
Update your database credentials in `.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD="your_mysql_password"
DB_NAME=leave_management

JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRES_IN=24h

CLIENT_URL=http://localhost:5173
```

### 2. Install Dependencies
Install dependencies for both backend and frontend:
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
cd ..
```

### 3. Initialize Database & Seed Data
Execute the setup script from the root folder:
```bash
npm run setup:db
```
*This creates the `leave_management` database, builds all tables, sets foreign key constraints, and seeds demo accounts and leave records.*

### 4. Run the Application
In separate terminal windows:

**Start Backend Server:**
```bash
npm run server
# Server will run on http://localhost:5000
```

**Start Frontend Application:**
```bash
npm run client
# Client will run on http://localhost:5173
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 🔑 Demo Credentials

| Role | Email | Password | Details |
|---|---|---|---|
| **HOD / Admin** | `hod@college.local` | `Admin@123` | Department Head |
| **Student 1** | `aarav@college.local` | `Student@123` | Roll No: `CS2024001`, Sec A |
| **Student 2** | `priya@college.local` | `Student@123` | Roll No: `CS2024002`, Sec A |
| **Student 3** | `rahul@college.local` | `Student@123` | Roll No: `CS2024003`, Sec B |
| **Student 4** | `ananya@college.local` | `Student@123` | Roll No: `CS2024004`, Sec B |
| **Student 5** | `vikram@college.local` | `Student@123` | Roll No: `CS2024005`, Sec A |

*Tip: The login page includes one-click "Demo Student" and "Demo HOD" buttons to quickly fill credentials.*

---

## 🧪 Automated Testing

The repository includes a comprehensive 27-point automated integration and security test suite:
```bash
npm run test:api
```

This verifies:
- Health check endpoints
- Valid and invalid login credentials
- Role enforcement (Students cannot access HOD routes; HOD cannot access Student routes)
- Unauthenticated access blocks
- Date and reason validation on leave submissions
- Cross-student data isolation (Student A cannot read or cancel Student B's leave)
- State machine transitions (Pending $\rightarrow$ Approved / Rejected / Cancelled)
- Prevention of post-approval modification or cancellation
- Mandatory rejection reason enforcement

---

## 📡 REST API Summary

### Auth Endpoints
- `POST /api/auth/register` — Register a student account with profile
- `POST /api/auth/login` — Login and receive JWT
- `GET  /api/auth/me` — Retrieve active authenticated user and student profile

### Student Endpoints (Requires `role='student'`)
- `GET   /api/student/dashboard` — Student leave statistics
- `POST  /api/leaves` — Submit new leave request
- `GET   /api/leaves/my` — Get paginated list of own leaves
- `GET   /api/leaves/:id` — Get single leave application details
- `PATCH /api/leaves/:id/cancel` — Cancel pending leave application

### HOD Endpoints (Requires `role='hod'`)
- `GET   /api/hod/dashboard` — Department-wide leave statistics
- `GET   /api/hod/leaves` — Filtered & searchable leave list with pagination
- `GET   /api/hod/leaves/:id` — Full leave details with student profile
- `PATCH /api/hod/leaves/:id/approve` — Approve pending leave application
- `PATCH /api/hod/leaves/:id/reject` — Reject pending leave with mandatory reason
- `GET   /api/hod/students` — Directory of all registered students

---

## 🔮 Future Enhancements
- Email / SMS notifications on approval or rejection.
- PDF export for approved gate passes / leave slips.
- Document / medical certificate file uploads with cloud storage integration.
- Multi-department HOD delegation and hierarchy.
