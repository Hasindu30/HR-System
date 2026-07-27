# HRM System

This repository contains a full-stack **Human Resource Management (HRM) System** built as a hiring assessment project. It includes a FastAPI backend with PostgreSQL & Alembic migrations, and a Next.js (TypeScript + Tailwind CSS) frontend dashboard.

---

## Project Overview

The HRM System provides a centralized dashboard for managing company departments, job positions, employee records, document attachments, and payroll calculations.

Key capabilities:
- JWT-based authentication for user register, login, current user info, and logout.
- Department CRUD management.
- Position CRUD management linked with departments.
- Employee CRUD directory supporting onboarding, status tracking (`ACTIVE`, `INACTIVE`, `ONBOARDING`, `TERMINATED`), and document uploads.
- Configurable employee document storage (upload, list, download, delete).
- Payroll management with server-side net salary calculations.
- Live database-driven dashboard metrics.

---

## Features

- **Authentication & Authorization**: Password hashing (bcrypt via passlib), JWT access token generation, and dependency-based API route protection (`/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`).
- **Department Management**: Create, list, retrieve, update, and delete organizational departments (`/departments`).
- **Position Management**: Create, list, retrieve, update, and delete job positions mapped to departments (`/positions`).
- **Employee Directory**: Manage employee records including unique employee codes, personal info, department/position bindings, joining dates, employment types, and statuses (`/employees`).
- **Document Management**: Attach documents to employee profiles with extension/MIME validation, 5MB limit, random UUID storage names, and database metadata tracking (`/employees/{id}/documents`, download, delete).
- **Payroll Processing**: Automated net salary calculation, status tracking (`PENDING`, `PAID`, `FAILED`), and monthly payroll records (`/payrolls`).
- **Dashboard Metrics**: Real-time database metrics for total employees, departments, positions, monthly payroll total, pending payroll count, and recent employee listings (`/dashboard/stats`).
- **Interactive Documentation**: FastAPI Swagger UI available out-of-the-box at `/docs`.

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Database Migrations**: Alembic
- **Auth**: JWT (`python-jose`, `passlib`, `bcrypt==4.0.1`)

### Database
- PostgreSQL

---

## Project Structure

```
hrm-system/
  backend/
    alembic/
      versions/
        0001_initial.py
      env.py
    app/
      core/
        config.py
        security.py
      dependencies/
        auth.py
      models/
        __init__.py
      routers/
        auth.py
        dashboard.py
        departments.py
        employees.py
        payrolls.py
        positions.py
      schemas/
        __init__.py
      database.py
      main.py
    uploads/
    requirements.txt
    .env.example
    alembic.ini
  frontend/
    src/
      app/
        dashboard/
        departments/
        employees/
        login/
        payroll/
        positions/
        register/
        globals.css
        layout.tsx
        page.tsx
      components/
        layout/
          DashboardLayout.tsx
          Navbar.tsx
          Sidebar.tsx
        ui/
          Button.tsx
          Card.tsx
          FileUpload.tsx
          Input.tsx
          Modal.tsx
          Select.tsx
          StatusBadge.tsx
          Table.tsx
      lib/
        api.ts
        auth.ts
      types/
        index.ts
    .env.example
  README.md
```

---

## Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher
- **PostgreSQL**: Installed and running locally or accessible via network

---

## PostgreSQL Setup

1. Create a database named `hrm_db`:
```sql
CREATE DATABASE hrm_db;
```

2. Note: You must update the `DATABASE_URL` in `backend/.env` with your actual PostgreSQL username and password.

---

## Environment Variables

### Backend Environment File (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hrm_db
SECRET_KEY=change-this-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=uploads
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment File (`frontend/.env.local`)
Copy `frontend/.env.example` to `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Backend Setup & Run Instructions

### Windows (PowerShell)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Linux / macOS
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

The backend server will run at:
- **Backend API**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`

---

## Database Migration

Database schema versioning and creation are managed using **Alembic**.

To apply existing migrations:
```bash
alembic upgrade head
```

To generate new migrations after modifying SQLAlchemy models:
```bash
alembic revision --autogenerate -m "description_of_changes"
alembic upgrade head
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend application will run at:
- **Frontend App**: `http://localhost:3000`

---

## API Overview

Full interactive API documentation is available at `http://localhost:8000/docs`. A summary of core router endpoints:

### Authentication (`/auth`)
- `POST /auth/register`: Create a new user account.
- `POST /auth/login`: Authenticate email + password and receive JWT access token.
- `GET /auth/me`: Get details of the currently logged-in user.
- `POST /auth/logout`: Server-side endpoint acknowledging logout (token removed client-side).

### Departments (`/departments`)
- `POST /departments`: Create a department.
- `GET /departments`: List all departments.
- `GET /departments/{id}`: Get a department by ID.
- `PATCH /departments/{id}`: Update a department.
- `DELETE /departments/{id}`: Delete a department.

### Positions (`/positions`)
- `POST /positions`: Create a position linked to a department.
- `GET /positions`: List positions (supports optional `department_id` filter).
- `GET /positions/{id}`: Get position details.
- `PATCH /positions/{id}`: Update position details.
- `DELETE /positions/{id}`: Delete a position.

### Employees & Documents (`/employees`)
- `POST /employees`: Create employee record.
- `GET /employees`: List all employees with department and position details.
- `GET /employees/{id}`: Get employee details.
- `PATCH /employees/{id}`: Update employee record.
- `DELETE /employees/{id}`: Delete employee record.
- `POST /employees/{id}/documents`: Upload a document for an employee.
- `GET /employees/{id}/documents`: List documents attached to an employee.
- `GET /employees/documents/{document_id}/download`: Download an employee document.
- `DELETE /employees/documents/{document_id}`: Delete an employee document from disk & DB.

### Payroll (`/payrolls`)
- `POST /payrolls`: Create payroll record.
- `GET /payrolls`: List payroll records.
- `GET /payrolls/{id}`: Get payroll details.
- `PATCH /payrolls/{id}`: Update payroll record.
- `DELETE /payrolls/{id}`: Delete payroll record.

### Dashboard (`/dashboard`)
- `GET /dashboard/stats`: Retrieve real database stats and recent employee listings.

---

## Employee Document Upload

- **Supported Document Types**: `NIC/ID Copy`, `Passport Copy`, `CV/Resume`, `Education Certificate`, `Previous Employment Letter`, `Bank Details`, `Signed Contract`, `Other`.
- **Supported File Formats**: `PDF`, `JPG`, `JPEG`, `PNG` (MIME types: `application/pdf`, `image/jpeg`, `image/png`).
- **File Size Limit**: Maximum **5 MB** per file.
- **Storage Strategy**: Uploaded files are assigned a unique UUID filename on disk under `UPLOAD_DIR` (`backend/uploads/`) to prevent path traversal, while original filenames and metadata are stored in the `employee_documents` table.

---

## Payroll Calculation

All net salary calculations are performed securely on the backend:

$$\text{Net Salary} = \text{Basic Salary} + \text{Allowances} - \text{Deductions}$$

- `basic_salary`, `allowances`, and `deductions` must be non-negative values.
- Client-submitted net salary values are never trusted; FastAPI recalculates `net_salary` during creation and update calls.
- Payment Status values: `PENDING`, `PAID`, `FAILED`.

---

## Screenshots

Placeholder paths for UI assessment screenshots:

- **Login**: `docs/screenshots/login.png` *(TODO)*
- **Register**: `docs/screenshots/register.png` *(TODO)*
- **Dashboard**: `docs/screenshots/dashboard.png` *(TODO)*
- **Departments**: `docs/screenshots/departments.png` *(TODO)*
- **Positions**: `docs/screenshots/positions.png` *(TODO)*
- **Employees**: `docs/screenshots/employees.png` *(TODO)*
- **Employee Document Upload**: `docs/screenshots/employee_documents.png` *(TODO)*
- **Payroll**: `docs/screenshots/payroll.png` *(TODO)*

---

## Testing / Verification

To verify the setup end-to-end:

1. Launch PostgreSQL and create the `hrm_db` database.
2. Run backend migrations: `alembic upgrade head`.
3. Start FastAPI server: `uvicorn app.main:app --reload --port 8000`.
4. Start Next.js frontend: `npm run dev` in `frontend/`.
5. Open `http://localhost:3000/register` to register an initial admin account.
6. Log in at `http://localhost:3000/login` to access the main dashboard.
7. Verify CRUD operations across Departments, Positions, Employees, Documents, and Payroll.
