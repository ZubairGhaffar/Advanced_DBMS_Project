# HITEC Smart University Portal (HiSUP)

An enterprise-grade Academic Enterprise Resource Planning (ERP) platform designed for modern university operations. HiSUP automates core academic, administrative, and financial workflows including student records, course registration, grading, attendance, fee management, library management, and hostel allocations.

The system utilizes **Virtual Private Database (VPD)** security policy constraints, stored procedures, database functions, triggers, and column-level encryption at the database tier to ensure strict access control and data integrity.

---

## 🛠️ Technology Stack

- **Frontend**: React, React Router, Axios, Bootstrap 5 (Styling using dark-glassmorphism theme)
- **Backend**: Node.js, Express, `node-oracledb` (Binary Oracle Driver), JSON Web Tokens (JWT) for stateless authentication
- **Database**: Oracle Database 12c+ (Express Edition / Enterprise Edition)
- **Version Control**: Git / GitHub

---

## 👥 System Roles & Portals

1. **Administrator**: Manages academic structures, programs, catalogs courses, sections, faculty assignments, student admissions, and audit logs.
2. **Student**: Accesses active course schedules, views semester-wise academic performance (SGPA & CGPA), registers for courses (max 18 CH limit), submits semester tuition payments, and checks out library books.
3. **Faculty**: Records lecture attendance (up to 16 lectures per term), inputs grades, updates students' exam records, and checks section workload statistics.
4. **Finance Cashier**: Configures program tuition structures, processes/verifies student payments semester-wise, and tracks unpaid balances using fee defaulter registers.

---

## 🚀 Installation & Setup Guide

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **Oracle Database XE** installed and running locally or in a cloud instance
- **SQL Developer** or SQL*Plus to execute database schema scripts

---

### Step 1: Database Setup
1. Open your Oracle SQL Developer or connection client.
2. Connect to your database using an administrative account (e.g., `SYSTEM` or `SYS`).
3. Open and run the database script: [HiSUP_DB_Script.sql](file:///c:/Users/zubai/OneDrive/Desktop/Ibrahim_project/database/HiSUP_DB_Script.sql).
   - This script drops any existing conflicting tables, creates all 20 base relational tables, defines necessary indexes, compiles stored procedures, triggers, custom functions (including security encryption and weighted CGPA), and seeds the system with initial test data.

---

### Step 2: Backend Configuration & Execution
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the required Node.js modules:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend/` directory and configure your connection environment variables:
   ```env
   PORT=4000
   NODE_ENV=development
   ORACLE_USER=system
   ORACLE_PASSWORD=your_oracle_password
   ORACLE_CONNECTION_STRING=localhost:1521/XE
   JWT_SECRET=your_jwt_secret_token
   ```
4. Start the backend development server:
   ```bash
   npm start
   ```
   The backend server will run on `http://localhost:4000`.

---

### Step 3: Frontend Configuration & Execution
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install the React application dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   The application will automatically open in your default browser at `http://localhost:3000`.

---

## 🔑 Seeded Login Credentials (Test Accounts)

You can log in to the portal using these seeded accounts to test different roles. The password for all seeded accounts is `password`.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@hitec.edu.pk` | `password` |
| **Student** | `student1@hitec.edu.pk` | `password` |
| **Faculty Member** | `faculty1@hitec.edu.pk` | `password` |
| **Finance cashier** | `finance@hitec.edu.pk` | `password` |

---

## 📌 Notable System Features
- **Credit-Hour Weighted GPA**:
  - Semester GPA (**SGPA**) and Cumulative GPA (**CGPA**) are calculated using standard university credit-hour weighting:
    $$\text{GPA} = \frac{\sum(\text{Grade Points} \times \text{Credit Hours})}{\sum\text{Credit Hours}}$$
- **Active Semester Enrollments**:
  - The "My Courses" page filters out completed (graded) courses to display only the student's active enrollments for the ongoing semester.
- **Semester-Wise Fee Clearance**:
  - Students submit tuition payment vouchers by selecting a target semester (Fall, Spring, Summer). Outstanding balances and defaults are tracked individually per term.
- **Sensitive Data Security**:
  - Student CNICs and Faculty bank account routing details are encrypted transparently inside the Oracle DB using a deterministic encryption helper (`fn_encrypt_value`).
