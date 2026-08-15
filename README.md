# StoreRate - Full-Stack Store Rating Application

StoreRate is a modern, responsive full-stack platform built with Node.js, Express, MySQL, Sequelize ORM, and React (Vite). It provides a unified authentication and role-based access control (RBAC) system for three distinct roles: **System Administrator**, **Normal User**, and **Store Owner**.

---

## 🚀 Features

### 🔐 Authentication & Roles
- **Single Login**: Unified `/api/auth/login` endpoint for all three roles with role-based redirection.
- **Public Signup**: Public `/api/auth/signup` strictly creates Normal User accounts.
- **Password Updates**: Secure `/api/auth/update-password` with old password verification and strength rules.
- **JWT Authentication**: Secure Bearer tokens attached via Axios interceptors and cookie support.
- **Bcrypt Hashing**: All passwords securely hashed using salted bcrypt before database persistence.

### 👑 System Administrator
- **Platform Analytics**: Real-time metrics for total users, stores, and ratings.
- **User Management**: Filter by name, email, address, and role; sortable column headers (Name, Email, Address, Role, Date); Add User modal; and User Details modal (displaying Store Owner aggregate ratings and assigned stores).
- **Store Management**: Register new retail stores, assign them to registered store owners, filter and sort by Name, Email, Address, and computed Overall Rating.

### 👤 Normal User
- **Store Directory**: Search stores in real-time by Name or Address.
- **Dynamic Star Ratings**: Interactive 1–5 star rating widget to submit new ratings or modify existing ratings inline with instant optimistic updates.
- **Rating Integrity**: Unique constraint prevents duplicate ratings per user/store, automatically updating existing ratings.

### 🏢 Store Owner
- **Store Performance**: Live dashboard displaying store details and active listing status.
- **Average Rating**: Real-time computed average score across all customer ratings.
- **Customer Feedback**: Sortable table of all customer reviews including customer name, email address, star rating, and timestamp.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express.js |
| **Database** | MySQL 8.0 |
| **ORM** | Sequelize (with Migrations & Seeders) |
| **Authentication** | JWT (`jsonwebtoken`), `bcrypt` |
| **Validation** | `express-validator` (backend) & matching client-side validation |
| **Frontend** | React 18 (Vite), React Router v6, Axios, Lucide Icons |
| **Styling** | Modern CSS Design System (Glassmorphism, Vibrant Gradients, Responsive Design) |

---

## 📋 Strict Validation Rules

Both frontend forms and backend API endpoints strictly enforce:
- **Name**: Between 20 and 60 characters.
- **Address**: Maximum 400 characters.
- **Password**: 8–16 characters, at least 1 uppercase letter (`A-Z`), and at least 1 special character (`!@#$%^&*...`).
- **Email**: Standard email format validation.
- **Rating**: Integer between 1 and 5.

---

## ⚙️ Prerequisites

- **Node.js** (v18+ or v24+ LTS)
- **npm** (v9+)
- **MySQL** running locally on port `3306`

---

## 📦 Setup & Installation

### 1. Clone & Database Setup

Make sure your MySQL server is running. You can create the database using the MySQL client or Workbench:

```sql
CREATE DATABASE storerate;
```

### 2. Backend Setup & Configuration

1. Navigate to `/backend`:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (or copy `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_DIALECT=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=storerate
   DB_USER=root
   DB_PASSWORD=Dawal@123

   # JWT Configuration
   JWT_SECRET=super_secret_jwt_key_for_storerate_assessment_2026
   JWT_EXPIRES_IN=7d

   # Frontend Origin
   FRONTEND_URL=http://localhost:5173
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Seed the default System Administrator:
   ```bash
   npm run db:seed
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *Backend will run on `http://localhost:5000`.*

### 3. Frontend Setup

1. Open a new terminal and navigate to `/frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will run on `http://localhost:5173`.*

---

## 🔑 Default Credentials

A default Administrator account is automatically created by the seed migration:

- **Role**: System Administrator (`admin`)
- **Email**: `admin@storerate.com`
- **Password**: `Admin@123`
- **Name**: `System Administrator Master`

> **Note**: Quick-fill demo buttons are provided on the Login page for convenient testing across Admin, Store Owner, and Normal User roles.

---

## 🧪 Testing

### Automated Backend & Integration Test Suite
To run the automated verification script:
```bash
cd backend
node e2e_simulation_test.js
```

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Public signup (Normal User role only).
- `POST /api/auth/login` - Unified login for all roles.
- `POST /api/auth/logout` - Clears auth session.
- `PUT /api/auth/update-password` - Updates authenticated user password.
- `GET /api/auth/me` - Returns currently authenticated user profile.

### Admin Only (`/api/admin`)
- `GET /api/admin/dashboard` - Total counts for users, stores, ratings.
- `POST /api/admin/users` - Create user with any role (`admin`, `store_owner`, `user`).
- `GET /api/admin/users` - List users with search filters (`name`, `email`, `address`, `role`) and sorting (`sortBy`, `sortOrder`).
- `GET /api/admin/users/:id` - User details (includes store average ratings for store owners).
- `POST /api/admin/stores` - Register store with optional store owner assignment.
- `GET /api/admin/stores` - List stores with filters, sorting, and computed average ratings.

### Normal Users (`/api/stores`)
- `GET /api/stores` - List all stores with search (`name`, `address`), sorting, average rating, and current user's rating.
- `POST /api/stores/:id/rating` - Submit 1–5 star rating.
- `PUT /api/stores/:id/rating` - Modify existing rating.

### Store Owner (`/api/store-owner`)
- `GET /api/store-owner/dashboard` - Get owner's store details, computed average rating, and table of raters.
