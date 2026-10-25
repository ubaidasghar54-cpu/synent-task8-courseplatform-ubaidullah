# LearnHub - Online Course Platform

A full-stack online learning platform built with the MERN stack (MongoDB, Express, React, Node.js). Users can browse courses, view syllabi, make test payments via Razorpay, watch video lessons, and track their learning progress.

Developed by **Ubaidullah** for the **Synent Technologies Web Development Internship (Task 8)**.

---

## Features

- **Course Catalog:** Search courses by keyword, filter by category, and sort by price or date.
- **Video Classroom:** Stream lessons in a responsive video player, navigate between modules, and mark lessons as complete.
- **Progress Tracking:** Tracks completed lessons and calculates overall percentage for each enrolled course.
- **Razorpay Payments (Test Mode):** Secure checkout flow with server-side signature verification and automated email receipts.
- **User Authentication:** Registration, login, and password reset with JWT tokens and bcrypt password hashing.
- **Admin Panel:** Create and edit courses, add modules and video lessons, and view registered students and enrollments.
- **Email Notifications:** Automatic emails via Nodemailer for registration confirmation and payment receipts.

---

## Tech Stack

- **Frontend:** React 18, Vite, React Router 6, Axios, Lucide React
- **Backend:** Node.js, Express.js, Mongoose, JSON Web Tokens, Crypto
- **Database:** MongoDB Atlas
- **Payments:** Razorpay API (Test Mode)
- **Emails:** Nodemailer (Ethereal test accounts in development)

---

## Currency Configuration (PKR)

The platform is configured to display and process course prices in **Pakistani Rupees (PKR / Rs.)**.

### How Currency is Handled

1. **Frontend Formatting:**  
   Prices are formatted using a dedicated helper in `client/src/utils/formatPrice.js`. It uses JavaScript's native `Intl.NumberFormat` with the `en-PK` locale and reads `VITE_CURRENCY` from the client environment (defaulting to `PKR`). This keeps formatting consistent across all pages (Dashboard, Course Details, Admin Panel) without hard-coding currency symbols.

2. **Backend Configuration:**  
   The active currency is defined in `server/.env` via `CURRENCY=PKR`. Course prices in MongoDB are stored in whole numbers (e.g., `4999` for Rs 4,999). When creating a Razorpay order, the amount is converted to the smallest currency unit (paisas) using:
   ```javascript
   const amountInSubunits = Math.round(price * 100);
   ```

3. **Database & Receipts:**  
   When a payment is captured, the currency is saved directly to the `Payment` document in MongoDB and included in the confirmation email receipt.

---

## Razorpay International Payments & Test Mode Fallback

### Why This is Needed
Razorpay officially supports international currencies including `PKR`. However, standard Razorpay merchant accounts must have **International Payments enabled** in their dashboard to accept non-INR transactions. If international payments are disabled, Razorpay will reject orders created with `currency: "PKR"`.

### Built-in Test Mode Fallback
To keep local development smooth even if your test account only accepts INR, the backend includes an optional charge fallback:

- `RAZORPAY_CHARGE_CURRENCY=INR` (in `server/.env`)
- `EXCHANGE_RATE=0.30` (configurable exchange rate, e.g. 1 PKR = 0.30 INR)

**How it works:**
- The frontend always displays prices to the user in PKR (e.g. `Rs 4,999`).
- The server computes the test charge amount in INR using the exchange rate:
  ```javascript
  const chargePrice = course.price * exchangeRate;
  const amountInSubunits = Math.round(chargePrice * 100);
  ```
- Razorpay processes the test payment in INR without rejecting the order.
- The user is enrolled, and the payment is saved.

> **Note:** This fallback is intended for test-mode development and demonstration purposes when international payments are not enabled on your Razorpay test account. It is not real-time banking forex conversion.

---

## How to Change Currency in the Future

If you want to switch the platform to another currency (e.g., USD, EUR, or INR):

1. **Update Client Environment:**
   In `client/.env`, change:
   ```env
   VITE_CURRENCY=USD
   ```

2. **Update Server Environment:**
   In `server/.env`, change:
   ```env
   CURRENCY=USD
   ```
   *(If charging in the same currency directly, make sure `RAZORPAY_CHARGE_CURRENCY` matches or is commented out).*

3. **Update Course Prices (Optional):**
   If you want to adjust the base sample prices for the new currency, update `sampleCourses` in `server/utils/seedCourses.js` and re-seed:
   ```powershell
   npm run seed
   ```

4. **Restart Servers:**
   Restart both the backend (`npm run dev`) and Vite frontend server (`npm run dev`) to pick up the updated environment variables.

---

## Project Structure

```
synent-task8-courseplatform-ubaidullah/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/axios.js        # Axios instance with JWT interceptor
│   │   ├── components/         # Navbar, Footer, ProtectedRoute
│   │   ├── context/            # AuthContext (login state, token storage)
│   │   ├── pages/              # Home, Dashboard, CourseDetails, LearnCourse, etc.
│   │   │   └── admin/          # Admin dashboard & curriculum management
│   │   ├── utils/
│   │   │   └── formatPrice.js  # Currency formatter helper (Intl.NumberFormat)
│   │   ├── App.jsx             # React router configuration
│   │   └── main.jsx            # Entry point
│   ├── .env.example            # Sample client environment file
│   └── package.json
│
├── server/                     # Backend (Node.js + Express)
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Auth, course, enrollment, and payment controllers
│   ├── middleware/             # JWT protect and admin middleware
│   ├── models/                 # Course, Enrollment, Payment, and User models
│   ├── routes/                 # Express API routes
│   ├── utils/
│   │   ├── formatPrice.js      # Shared formatting helpers
│   │   ├── seedAdmin.js        # Admin user seeder script
│   │   ├── seedCourses.js      # Sample course seeder script (PKR prices)
│   │   └── sendEmail.js        # Nodemailer email sender
│   ├── .env.example            # Sample server environment file
│   ├── server.js               # Express application entry point
│   └── package.json
│
└── README.md
```

---

## Environment Variables

### Client (`client/.env.example`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder
VITE_CURRENCY=PKR
```

### Server (`server/.env.example`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/courseplatform?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d
CURRENCY=PKR

# Optional test fallback for Razorpay accounts without international currency enabled
# RAZORPAY_CHARGE_CURRENCY=INR
# EXCHANGE_RATE=0.30

# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder_secret

# Email Configuration (defaults to auto-generated Ethereal test inbox in dev)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=placeholder_user
EMAIL_PASS=placeholder_pass
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Atlas account (or local MongoDB server)
- Razorpay test account (free at razorpay.com)

### 1. Clone the Repository
```powershell
git clone <repository-url>
cd synent-task8-courseplatform-ubaidullah
```

### 2. Backend Setup
1. Navigate to the `server/` directory:
   ```powershell
   cd server
   ```
2. Create your `.env` file by copying the template:
   ```powershell
   copy .env.example .env
   ```
3. Open `server/.env` and fill in your `MONGO_URI`, `JWT_SECRET`, and Razorpay test credentials.
4. Install dependencies:
   ```powershell
   npm install
   ```
5. Seed sample courses and admin user:
   ```powershell
   npm run seed
   npm run seed:admin
   ```
6. Start the backend development server:
   ```powershell
   npm run dev
   ```
   The backend will run at `http://localhost:5000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to `client/`:
   ```powershell
   cd client
   ```
2. Create your `.env` file by copying the template:
   ```powershell
   copy .env.example .env
   ```
3. Open `client/.env` and verify `VITE_API_URL` and `VITE_CURRENCY=PKR`.
4. Install dependencies:
   ```powershell
   npm install
   ```
5. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   The frontend will run at `http://localhost:5173`.

---

## Demo Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@example.com` | `Admin@123456` | Manage courses, modules, lessons, and view all student enrollments |
| **Student** | `student@example.com` | `Password123` | Browse catalog, test checkout, access enrolled lessons, track progress |

*(You can also register a brand new student account directly from the register page).*

---

## API Overview

### Auth (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Log in and receive JWT token
- `GET /me` - Get profile of authenticated user
- `POST /forgot-password` - Send password reset email
- `POST /reset-password` - Reset password with reset token

### Courses (`/api/courses`)
- `GET /` - List courses (supports search, category filter, sort)
- `GET /categories` - List all unique categories
- `GET /:id` - Get course details and syllabus
- `POST /` - Create a course (Admin only)
- `PUT /:id` - Update course details (Admin only)
- `DELETE /:id` - Delete a course (Admin only)
- `POST /:id/modules` - Add a module to a course (Admin only)
- `POST /:id/modules/:mId/lessons` - Add a lesson to a module (Admin only)

### Payments & Enrollments
- `POST /api/payments/create-order` - Create a Razorpay order in configured currency
- `POST /api/payments/verify-payment` - Verify payment signature and enroll user
- `GET /api/enrollments/my-courses` - Get enrolled courses with progress
- `GET /api/enrollments/course/:id/learn` - Access video lessons for enrolled course
- `PATCH /api/enrollments/course/:id/lesson/:lId/toggle` - Toggle lesson completed status

### Admin (`/api/admin`)
- `GET /users` - List all registered users
- `GET /enrollments` - List all student enrollments and calculate revenue

---

## License

This project is licensed under the MIT License. Developed for educational purposes as part of the Synent Technologies internship.
