# UCU Campus Lost & Found

Local Windows development project using React, Material UI, Express, JWT authentication and MySQL.

## Requirements
- Node.js 20 or newer (Node 22 LTS recommended)
- MySQL 8+
- VS Code / MySQL Workbench (recommended)

## A. Create the database
Open MySQL Workbench and run `database/schema.sql`. This creates `ucu_lost_found` and the users, items, claims and notifications tables.

## B. Configure and run backend
Open PowerShell in this project folder:
```powershell
cd backend
copy .env.example .env
```
Edit `backend/.env`: set your MySQL password and replace `JWT_SECRET` with a long random private value. Then:
```powershell
npm install
npm run dev
```
Backend: http://localhost:5000
Health check: http://localhost:5000/api/health

## C. Run frontend in a SECOND PowerShell terminal
```powershell
cd frontend
npm install
npm run dev
```
Open the Local URL printed by Vite (normally http://localhost:5173). Keep both terminals and MySQL running.

## D. Create first admin
Register a normal user through the application. Then execute in MySQL Workbench:
```sql
USE ucu_lost_found;
UPDATE users SET role='admin' WHERE email='your-email@ucu.ac.ug';
```
Sign out and sign back in for the admin role to refresh in the login token.

## 15 individual frontend routes
1 `/login`  2 `/register`  3 `/dashboard`  4 `/report-lost`  5 `/report-found`
6 `/items`  7 `/search`  8 `/items/:id`  9 `/claims/new`  10 `/my-claims`
11 `/notifications`  12 `/profile`  13 `/profile/edit`  14 `/admin`  15 `/admin/manage`

## Current scope / honest limitations
This is a fresh starter project built from the requirements visible in chat. The original application ZIP and the two PDF specification documents were not attached, so exact matching to those materials has not been verified. The included item form supports an optional image URL, not uploading image files. Password reset email, email verification, and production hosting are not configured. Do not use development secrets in a public deployment.
