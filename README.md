# CoreInventory

A simple full-stack inventory management system. It tracks products, suppliers, purchases and sales, and keeps stock levels up to date automatically. Built with React, Node.js, Express and MySQL.

## Features

- **Login and sign up** with JWT authentication and hashed passwords
- **Two roles:** Admin and Staff
- **Products:** add, edit, delete, with automatic stock status (Available, Low Stock, Out of Stock)
- **Suppliers:** manage supplier details
- **Purchases:** recording a purchase increases stock
- **Sales:** recording a sale decreases stock, and is blocked if there is not enough stock
- **Dashboard:** total products, low stock items, total purchased, total sold, and a restocking list

## Roles

| Action | Admin | Staff |
|---|---|---|
| View products, suppliers, purchases, sales, dashboard | Yes | Yes |
| Record purchases and sales | Yes | Yes |
| Add, edit, delete products | Yes | No |
| Add, edit, delete suppliers | Yes | No |

Roles are enforced in the backend, not just hidden in the interface.

## Tech Stack

| Part | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express |
| Database | MySQL |
| Security | JWT (jsonwebtoken), bcrypt, dotenv, cors |

## Project Structure

```
CoreInventory/
  backend/
    config/db.js              MySQL connection
    middleware/auth.js        verifyToken and adminOnly guards
    routes/
      auth.js                 login and register
      products.js
      suppliers.js
      purchases.js
      sales.js
      dashboard.js
    seedAdmin.js              creates the first admin user
    seedStaff.js              creates a sample staff user
    server.js                 starts the Express server
    .env.example              example environment variables
  frontend/
    src/
      main.jsx                React entry point
      App.jsx                 page routes
      Layout.jsx              sidebar layout
      api.js                  Axios helper (adds the token automatically)
      pages/                  Login, Register, Dashboard, Products,
                              Suppliers, Purchases, Sales
  database.sql                database and table creation script
```

## Database Tables

- `users` (name, email, hashed password, role)
- `suppliers` (name, phone, email, address)
- `products` (name, category, price, quantity, minimum_stock, supplier_id)
- `purchases` (product_id, supplier_id, quantity, purchase_date)
- `sales` (product_id, quantity, sale_date)

Stock status is calculated from `quantity` and `minimum_stock`, and is not stored.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS version)
- [MySQL](https://dev.mysql.com/downloads/installer/) with MySQL Workbench

### 1. Clone the repository

```bash
git clone https://github.com/Mahiramani32/FSD.git
cd FSD
```

### 2. Set up the database

Open MySQL Workbench, then open and run `database.sql`. This creates the `coreinventory` database and its tables.

### 3. Set up the backend

```bash
cd backend
npm install
```

Copy `.env.example` to a new file named `.env` and fill in your values:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=coreinventory
JWT_SECRET=choose_a_secret_key
ADMIN_CODE=choose_an_admin_signup_code
```

Create the first admin user (run this only once):

```bash
node seedAdmin.js
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 4. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Default accounts (for testing only)

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| Staff | staff@example.com | staff123 (after running `node seedStaff.js`) |

Change these before using the project anywhere other than your own computer.

## Sign Up and Admin Code

Anyone can sign up as Staff. Signing up as Admin requires the `ADMIN_CODE` from the backend `.env` file, so users cannot make themselves admins.

## API Endpoints

All endpoints except login and register need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/login` | Public | Log in and get a token |
| POST | `/api/register` | Public | Create an account |
| GET | `/api/products` | Logged in | List products with stock status |
| POST, PUT, DELETE | `/api/products` | Admin | Add, edit, delete products |
| GET | `/api/suppliers` | Logged in | List suppliers |
| POST, PUT, DELETE | `/api/suppliers` | Admin | Add, edit, delete suppliers |
| GET, POST | `/api/purchases` | Logged in | List and record purchases (stock goes up) |
| GET, POST | `/api/sales` | Logged in | List and record sales (stock goes down) |
| GET | `/api/dashboard` | Logged in | Summary numbers |

## Security

- Passwords are hashed with bcrypt and never stored as plain text
- JWT tokens expire after 1 day
- Role checks are enforced in the backend middleware (401 for not logged in, 403 for not allowed)
- SQL queries use placeholders to prevent SQL injection
- Purchases and sales use database transactions, so stock and records stay consistent
- Secrets are kept in `.env`, which is not uploaded to GitHub

## Future Improvements

- Search and filters on products and suppliers
- Export reports to CSV
- Change password and user management for admins
- Deployment to an online server
