# LuxeLeather E-Commerce

Premium organic leather bags e-commerce platform built with Next.js, MySQL, and MongoDB.

## Features
- **Frontend**: Next.js 14+ (App Router), TailwindCSS, Framer Motion (animations via CSS).
- **Database**: 
  - **MongoDB**: Stores Product data (flexible schema).
  - **MySQL**: Stores Users and Orders (relational data).
- **Authentication**: JWT-based secure auth with HTTP-Only cookies.
- **Admin Dashboard**: Manage products, view stats (protected route).
- **Notifications**: Email notifications for Users and Admins upon order using Nodemailer.

## Prerequisites
1. **Node.js**: 18.17+
2. **MongoDB**: Running on `localhost:27017`
3. **MySQL**: Running on `localhost:3306`

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   The `.env.local` file is pre-configured for local development. Ensure your Database credentials match.

   ```env
   MONGODB_URI=mongodb://localhost:27017/ecommerce_db
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=
   MYSQL_DATABASE=ecommerce_db
   JWT_SECRET=complex_secret_key
   ```

3. **Database Setup**
   - Ensure MongoDB is running.
   - Ensure MySQL is running. The app will automatically attempt to create tables (`sequelize.sync()`).

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access**
   - **Store**: http://localhost:3000
   - **Admin**: http://localhost:3000/admin (Redirects to login)
   - **Login**: Use `admin@luxeleather.com` (Password: any for first time, it auto-creates admin account for demo).

## Project Structure
- `src/app`: App Router pages and API routes.
- `src/components`: Reusable UI components.
- `src/lib`: Database and Auth utilities.
- `src/models`: Database Models (Mongoose & Sequelize).
- `src/context`: React Context (Cart).

## Security
- JWT Tokens are stored in HTTP-Only cookies to prevent XSS.
- CSRF protection via SameSite cookie policy.
- Middleware protects `/admin` routes.
- Logout clears the cookie from the browser.
