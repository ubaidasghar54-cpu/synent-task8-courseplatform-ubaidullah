# LearnHub - Full-Stack Online Course Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.3.1-blue.svg)](https://react.dev/)
[![Express Version](https://img.shields.io/badge/express-%5E4.21.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB Mongoose](https://img.shields.io/badge/mongoose-%5E8.9.5-green.svg)](https://mongoosejs.com/)

> **Synent Technologies Web Development Internship (Advanced Level)**  
> **Task 8: Online Course Platform**  
> **Author:** Ubaidullah

---

## 📖 Executive Summary

**LearnHub** is an enterprise-grade, full-stack educational web application that empowers users to discover, purchase, and learn from structured video courses. Built with a decoupled MERN architecture, the platform features cryptographic test payments via Razorpay, real-time curriculum progress calculation, server-side content protection, automated Nodemailer emails, and a comprehensive administrative management and auditing suite.

---

## 🎨 Design System & Palette

The platform strictly adheres to a modern, accessible design system:
- **Primary Dark (Surface/Text):** `#0F172A` (Slate 900)
- **Primary Accent (Brand):** `#3B82F6` (Blue 500)
- **Accent Highlight (Badges/Gold):** `#FBBF24` (Amber 400)
- **Light Surface / Background:** `#F8FAFC` (Slate 50)
- **Google Font:** *Plus Jakarta Sans* (400, 500, 600, 700, 800)
- **Breakpoints:** Tested and verified at `360px` (mobile), `768px` (tablet), and `1280px+` (desktop widescreen).

---

## 🏗️ System Architecture & Request Flow

```
+-------------------------------------------------------------+
|                     1. CLIENT (Frontend)                   |
|  React (Vite) + React Router + Axios (Port 5173)            |
|  - Renders UI & AuthContext session rehydration             |
|  - Axios Request Interceptors automatically inject JWT      |
|  - Triggers Razorpay Checkout modal                         |
+------------------------------+------------------------------+
                               |
                   HTTP / REST (JSON API)
                   with Bearer Token Header
                               |
                               v
+-------------------------------------------------------------+
|                     2. SERVER (Backend)                     |
|  Node.js with Express (Port 5000)                           |
|  - Password Hashing (bcryptjs) & JWT Token Generation       |
|  - Role-Based Access Control (protect & admin middleware)   |
|  - Razorpay Order Creation & HMAC SHA-256 Verification      |
|  - Nodemailer Automated Dispatch (Welcome & Receipts)       |
+------------------------------+------------------------------+
                               |
                       Mongoose ODM
                               |
                               v
+-------------------------------------------------------------+
|                     3. DATABASE (Data Store)                |
|  MongoDB Atlas (Cloud Cluster)                              |
|  - Collections: Users, Courses, Enrollments, Payments       |
+------------------------------+------------------------------+
```

---

## ⚡ Core Features

1. **Authentication & Identity Lifecycle:**
   - User registration and login with `bcryptjs` password salting (10 rounds).
   - Stateless JWT tokens (7-day validity) with custom `protect` and `admin` middleware.
   - Defense against account enumeration attacks through uniform security messaging.
   - SHA-256 cryptographically hashed password reset tokens with 1-hour expiration.
   - Dedicated Email Verification and Account Recovery pages.

2. **Course Catalog & Discovery:**
   - 300ms debounced full-text search across titles and descriptions.
   - Interactive category pill filtering and price sorting (`Price: Low to High`, `Price: High to Low`, `Newest`).
   - Detailed course preview pages with structured module syllabus and lesson durations.
   - Field-level database projection (`.select('-modules.lessons.videoUrl')`) to protect video assets for non-enrolled visitors.

3. **Secure Razorpay Payment & Enrollment Flow:**
   - Server-side Razorpay order creation (`amount` in paise, currency `INR`).
   - Interactive Razorpay Checkout modal in React with prefilled user metadata.
   - Independent server recalculation of cryptographic signature using HMAC SHA-256:  
     $$\text{Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{KEY\_SECRET})$$
   - Guaranteed duplicate enrollment prevention using compound unique indexes (`{ user: 1, course: 1 }`).
   - Failed or dismissed transactions never grant course access.

4. **Classroom Learning Environment:**
   - Dedicated 2-column video classroom with responsive 16:9 embedded YouTube player.
   - Interactive playlist sidebar allowing seamless, non-reloading lesson switching.
   - One-click lesson completion toggling (`PATCH /api/enrollments/...`).
   - Real-time mathematical course completion percentage calculation.
   - Milestone celebration banner upon achieving 100% course completion.

5. **Administrative Management & Executive Auditor:**
   - Full Course CRUD (Create, Read, Update, Delete) with modal-based editor.
   - Dynamic Curriculum Manager: Author sequential modules and publish video lessons on the fly.
   - Executive KPI summary cards: Total Platform Revenue (₹), Registered Students, Active Enrollments, and Published Courses.
   - Real-time student sales ledger tracking exact progress percentage per enrollment.
   - Full user directory auditing verification and administrative permissions.

6. **Automated Transactional Emails (Nodemailer):**
   - Branded HTML welcome email dispatched asynchronously on user registration.
   - Itemized purchase receipt dispatched upon payment capture with Razorpay Order ID.
   - Automatic Ethereal email preview links generated in development.

---

## 📂 Project Directory Structure

```
synent-task8-courseplatform-ubaidullah/
│
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        # Configured Axios client with JWT interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Responsive navbar with mobile hamburger menu
│   │   │   ├── Footer.jsx      # Branded platform footer
│   │   │   └── ProtectedRoute.jsx # Route authentication guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state & session hydration
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx # 3-in-1 Course, Curriculum & Audit Suite
│   │   │   ├── CourseDetails.jsx  # Syllabus & Razorpay checkout trigger
│   │   │   ├── Dashboard.jsx      # Debounced search & course catalog
│   │   │   ├── ForgotPassword.jsx # Password recovery initiation
│   │   │   ├── Home.jsx           # High-impact landing page
│   │   │   ├── LearnCourse.jsx    # 16:9 Video classroom & playlist
│   │   │   ├── Login.jsx          # Accessible sign-in form
│   │   │   ├── MyCourses.jsx      # Student dashboard with progress bars
│   │   │   ├── NotFound.jsx       # Custom 404 page
│   │   │   ├── Register.jsx       # Student onboarding form
│   │   │   ├── ResetPassword.jsx  # SHA-256 token password reset form
│   │   │   └── VerifyEmail.jsx    # One-click email verification
│   │   ├── App.jsx             # Client-side router configuration
│   │   ├── index.css           # Design tokens, custom styles & responsive rules
│   │   └── main.jsx            # React DOM mounting entrypoint
│   ├── .env.example            # Client environment template
│   ├── index.html              # HTML shell with Google Font & Razorpay SDK
│   ├── package.json            # Client dependencies & scripts
│   └── vite.config.js          # Vite build and dev server configuration
│
├── server/                     # Backend API (Node.js + Express + Mongoose)
│   ├── config/
│   │   └── db.js               # MongoDB connection module
│   ├── controllers/
│   │   ├── adminController.js      # Users and enrollment auditing logic
│   │   ├── authController.js       # Register, login, verify, and reset logic
│   │   ├── courseController.js     # Catalog search, filter, and CRUD logic
│   │   ├── enrollmentController.js # Learning room access & progress toggle
│   │   └── paymentController.js    # Razorpay order and HMAC verification
│   ├── middleware/
│   │   └── authMiddleware.js   # protect and admin JWT verification
│   ├── models/
│   │   ├── Course.js           # Courses with nested modules & lessons
│   │   ├── Enrollment.js       # User-Course relationship with unique compound index
│   │   ├── Payment.js          # Razorpay transaction audit ledger
│   │   └── User.js             # User accounts with bcrypt helper & toJSON sanitization
│   ├── routes/
│   │   ├── adminRoutes.js      # Protected administrative endpoints
│   │   ├── authRoutes.js       # Public and private authentication routes
│   │   ├── courseRoutes.js     # Public catalog and admin course management
│   │   ├── enrollmentRoutes.js # Student learning and progress routes
│   │   └── paymentRoutes.js    # Razorpay order creation and verification
│   ├── utils/
│   │   ├── generateToken.js    # JWT token signing helper
│   │   ├── seedAdmin.js        # Admin account seeder
│   │   ├── seedCourses.js      # 5 educational sample courses seeder
│   │   └── sendEmail.js        # Nodemailer HTML templates & Ethereal preview
│   ├── .env.example            # Backend environment template
│   ├── package.json            # Backend dependencies & scripts
│   └── server.js               # Express application entrypoint
│
├── .gitignore                  # Strict Git ignore policy (secrets & node_modules)
└── README.md                   # Comprehensive technical documentation
```

---

## 🚀 Quickstart Installation Guide

### Prerequisites
- Node.js LTS (v20+ recommended)
- Git
- MongoDB Atlas free cluster connection string

### Step 1: Clone Repository & Configure Root
```powershell
git clone <your-github-repo-url>
cd synent-task8-courseplatform-ubaidullah
```

### Step 2: Configure Server Environment
Navigate to `server/` and create your `.env` file based on `.env.example`:
```powershell
cd server
copy .env.example .env
```
Open `server/.env` in VS Code and set your credentials:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/courseplatform?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_synent_task8
JWT_EXPIRES_IN=7d

# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder_secret

# Email Testing (Ethereal test accounts run automatically if left as placeholders)
EMAIL_SERVICE=ethereal
EMAIL_USER=placeholder_user
EMAIL_PASS=placeholder_pass
```

### Step 3: Install Server Packages & Seed Data
```powershell
# Install backend dependencies
npm.cmd install

# Seed the 5 complete educational sample courses
npm.cmd run seed

# Seed the administrator account
npm.cmd run seed:admin

# Start backend in development mode (nodemon)
npm.cmd run dev
```
*(Server will listen at `http://localhost:5000` with MongoDB connected)*

### Step 4: Configure Client & Launch
Open a **second PowerShell terminal**:
```powershell
cd client
copy .env.example .env

# Install frontend dependencies
npm.cmd install

# Launch Vite development server
npm.cmd run dev
```
*(Vite will open at `http://localhost:5173`)*

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `Admin@123456` | Full Admin Suite: Course CRUD, Curriculum Manager, Revenue & User Auditor |
| **Student** | `student@example.com` | `Password123` | Course Browsing, Razorpay Test Checkout, Learning Room, Progress Tracking |

---

## 🌐 API Reference

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user, hashes password, returns JWT |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, returns JWT |
| `GET` | `/api/auth/me` | Protected | Returns sanitized profile of logged-in user |
| `POST` | `/api/auth/forgot-password` | Public | Dispatches SHA-256 hashed password reset token |
| `POST` | `/api/auth/reset-password` | Public | Validates 1-hour token and updates password |
| `POST` | `/api/auth/verify-email` | Public | Validates email confirmation token |

### 2. Courses (`/api/courses`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Public | Catalog with debounced search, category & price sorting |
| `GET` | `/api/courses/categories` | Public | List of distinct course categories |
| `GET` | `/api/courses/:id` | Public/Enrolled | Course details; hides video URLs unless enrolled |
| `POST` | `/api/courses` | Admin | Publish a new course |
| `PUT` | `/api/courses/:id` | Admin | Update course metadata |
| `DELETE` | `/api/courses/:id` | Admin | Delete course and cascade delete enrollments |
| `POST` | `/api/courses/:id/modules` | Admin | Add sequential module |
| `POST` | `/api/courses/:id/modules/:mId/lessons` | Admin | Publish video lesson to module |

### 3. Payments & Enrollments (`/api/payments` & `/api/enrollments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create-order` | Protected | Creates Razorpay order ID |
| `POST` | `/api/payments/verify-payment` | Protected | Cryptographic HMAC SHA-256 verification & enrollment |
| `GET` | `/api/enrollments/my-courses` | Protected | User's enrolled courses with progress percentages |
| `GET` | `/api/enrollments/course/:id/learn` | Enrolled/Admin | Unlocks lesson video URLs for learning room |
| `PATCH` | `/api/enrollments/course/:id/lesson/:lId/toggle` | Protected | Mark/unmark lesson complete; recalculates % |

### 4. Admin Auditing (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Admin | User directory with active enrollment statistics |
| `GET` | `/api/admin/enrollments` | Admin | Total revenue (₹) and live student learning ledger |

---

## 🚢 Production Deployment Guide

### Option 1: Client Deployment (Vercel)
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) > **Add New Project**.
3. Select your repository and set the **Root Directory** to `client`.
4. Framework Preset: `Vite`.
5. Add Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID`: Your Razorpay test Key ID
6. Click **Deploy**.

### Option 2: Server Deployment (Render)
1. Sign in to [Render](https://render.com/) > **New Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_strong_production_secret`
   - `RAZORPAY_KEY_ID`: `your_razorpay_key_id`
   - `RAZORPAY_KEY_SECRET`: `your_razorpay_key_secret`
5. Click **Create Web Service**.

---

## 🔒 Security Best Practices Implemented

- **No Secrets in Version Control:** Secrets reside strictly in `.env` files; only `.env.example` templates are tracked by Git.
- **Cryptographic Password Salting:** Passwords salted with `bcryptjs` (10 rounds); never stored or returned in plaintext.
- **Automated Serialization Sanitization:** Mongoose `toJSON()` hook deletes `passwordHash`, `verifyToken`, and `resetToken` from all outgoing HTTP responses.
- **Server-Side Cryptographic Signature Verification:** Razorpay payments verified on Node.js using HMAC SHA-256 before granting course access.
- **Content Protection:** Video URLs are hidden from catalog requests and only served when verified against the `Enrollment` database collection.
- **Account Enumeration Defense:** Uniform 200 OK responses on forgot-password workflows prevent probing for registered emails.
- **Single-Origin CORS Configuration:** Cross-Origin Resource Sharing strictly whitelisted to the client's URL.

---

## 📜 License
This project is licensed under the MIT License — educational project created for Synent Technologies Web Development Internship.

