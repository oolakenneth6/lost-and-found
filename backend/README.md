# UCU Lost & Found Backend

## Project Overview

The UCU Lost & Found Backend is the server-side component of the UCU Lost & Found system. It works together with the frontend application to provide the main services required by the system.

The backend receives requests from the frontend, processes them, communicates with the MySQL database, authenticates users, manages lost and found items, handles claims and notifications, manages user profiles, and controls administrator access.

The backend acts as the connection between the frontend application and the database.

The general application flow is:

```text
User
  |
  v
Frontend Application
  |
  v
Backend API
  |
  v
MySQL Database
  |
  v
Backend API
  |
  v
Frontend Application
  |
  v
User
```

---

## 1. Purpose of the Backend

The main purpose of the backend is to provide the services and application logic required by the UCU Lost & Found system.

The backend is responsible for:

- User registration
- User login
- User authentication
- User profile management
- Lost item reporting
- Found item reporting
- Item management
- Claim submission
- Claim management
- Notifications
- Administrator access
- Administrator user management
- Database communication
- API security
- Role-based authorization

The backend prevents the frontend from directly communicating with the database. Instead, the frontend communicates with the backend through API endpoints.

---

## 2. System Architecture

The UCU Lost & Found system follows a frontend-backend-database architecture.

```text
+-----------------------------+
|           USER              |
+--------------+--------------+
               |
               v
+-----------------------------+
|         FRONTEND            |
|       React / Vite          |
+--------------+--------------+
               |
               | HTTP Requests
               v
+-----------------------------+
|          BACKEND            |
|      Node.js / Express      |
+--------------+--------------+
               |
               | Database Queries
               v
+-----------------------------+
|          MYSQL              |
|         Database            |
+-----------------------------+
```

- The frontend provides the user interface.
- The backend provides the API and application logic.
- The MySQL database stores the application's data.

---

## 3. How the Backend Works

When a user performs an action in the frontend, the frontend sends a request to the backend. For example, when a user reports a lost item:

```text
User
  |
  v
Lost Item Form
  |
  v
Frontend
  |
  | POST /api/items
  v
Backend
  |
  v
Authentication
  |
  v
Validation
  |
  v
MySQL Database
  |
  v
Backend Response
  |
  v
Frontend
  |
  v
User
```

The backend therefore acts as the middle layer between the frontend and the database.

---

## 4. Technologies Used

**Node.js** is the runtime environment for executing the backend JavaScript code.

**Express.js** creates the backend server and API routes.

**MySQL** is the relational database management system. It stores users, items, claims, and notifications.

**mysql2** allows the Node.js application to connect to the MySQL database.

**JSON Web Token (JWT)** is used for user authentication.

**bcrypt** is used for securely hashing and checking user passwords.

**dotenv** loads configuration values from the `.env` file.

**CORS** allows the frontend and backend to communicate when they run on different ports.

---

## 5. Backend Folder Structure

```text
lost-and-found-main/
│
├── database/
│   └── schema.sql
│
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   │
│   ├── database/
│   │   └── db.js
│   │
│   └── middleware/
│       └── auth.js
│
└── frontend/
```

Each important part of the backend has a specific responsibility.

---

## 6. server.js

The `server.js` file is the main entry point of the backend. It creates the Express application and defines the main API endpoints.

The server handles:

- Authentication
- Users
- Items
- Claims
- Notifications
- Profiles
- Administrator functionality

The backend runs on port **5001** during development. The API base address is:

```text
http://localhost:5001/api
```

---

## 7. database/db.js

The `backend/database/db.js` file handles the connection between the backend and MySQL. The backend uses this connection whenever it needs to access information stored in the database.

Database operations include:

- Creating users
- Finding users
- Updating users
- Retrieving items
- Creating items
- Updating items
- Creating claims
- Retrieving claims
- Updating claims
- Retrieving notifications
- Updating notifications

The database configuration is loaded using environment variables.

---

## 8. middleware/auth.js

The `middleware/auth.js` file contains authentication and administrator authorization middleware.

Authentication checks whether a user has supplied a valid JWT token. Administrator authorization checks whether the authenticated user has the `admin` role.

```text
Request
   |
   v
Authorization Header
   |
   v
Bearer Token
   |
   v
JWT Verification
   |
   +---- Invalid ----> 401 Unauthorized
   |
   v
Authenticated User
```

Administrator authorization then checks the user's role.

```text
Authenticated User
        |
        v
Check Role
        |
        +---- student ----> Access Denied
        |
        v
      admin
        |
        v
Administrator Access
```

---

## 9. Environment Configuration

The backend uses a `.env` file for configuration. The `.env` file is located inside the `backend` folder. A typical configuration contains:

```env
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ucu_lost_found
JWT_SECRET=your_secret_key
CLIENT_ORIGIN=http://localhost:5173
```

The actual values depend on the local development environment.

The `.env` file must **not** be committed to GitHub because it contains passwords and other sensitive information. The `.env.example` file is a template for configuring the backend.

---

## 10. Installing the Backend

Before running the backend, make sure Node.js and MySQL are installed.

Open PowerShell and navigate to the backend folder:

```powershell
cd "C:\Users\LEN\Downloads\lost-and-found-main\lost-and-found-main\backend"
```

Install the backend dependencies:

```powershell
npm install
```

The dependencies are defined in `package.json`.

---

## 11. Starting the Backend

After installing the dependencies and configuring the database, start the backend using:

```powershell
npm start
```

The backend runs on:

```text
http://localhost:5001
```

The API can then be accessed through:

```text
http://localhost:5001/api
```

Check that it works by opening `http://localhost:5001/api/health`. You should see:

```json
{"api":"ok","database":"connected"}
```

---

## 12. Database

The application uses MySQL as its database system. The database permanently stores application information.

The main types of information stored include:

- Users
- User roles
- Lost items
- Found items
- Claims
- Notifications

The database used by the application is `ucu_lost_found`. Its tables (`users`, `items`, `claims`, `notifications`) are created by `database/schema.sql`.

On Windows PowerShell, load the schema with:

```powershell
cmd /c """C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"" -u root -p < database\schema.sql"
```

---

## 13. Database Connection

The backend connects to MySQL using the information provided in `.env`. The configuration includes:

- Database Host
- Database Username
- Database Password
- Database Name

For example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ucu_lost_found
```

If these values are incorrect, the backend will not be able to communicate with the database.

---

## 14. Authentication

Authentication allows the system to identify users. Users can register accounts and log into the system.

After a successful login, the backend generates a JWT token. The frontend stores the token and uses it when making authenticated requests.

```text
User
  |
  v
Login Form
  |
  v
Frontend
  |
  | POST /api/auth/login
  v
Backend
  |
  v
Find User
  |
  v
Verify Password
  |
  v
Generate JWT
  |
  v
Return Token
  |
  v
Frontend
```

---

## 15. User Registration

The backend provides an endpoint for creating new user accounts:

```text
POST /api/auth/register
```

The registration request contains the information required to create a user account. The backend validates the information and stores the user in the database. Passwords are stored securely using password hashing rather than plain text.

---

## 16. User Login

The login endpoint is:

```text
POST /api/auth/login
```

When a user logs in, the backend:

1. Receives the email and password.
2. Searches for the user.
3. Checks the supplied password.
4. Determines the user's role.
5. Generates a JWT token.
6. Returns the token and user information.

The response is then used by the frontend to maintain the user's authenticated session.

---

## 17. JWT Authentication

JWT is used to authenticate users after login. The token contains information related to the authenticated user, such as:

- User ID
- Email
- Role

When making protected requests, the frontend sends:

```text
Authorization: Bearer TOKEN
```

The backend verifies the token before processing the request. If the token is invalid or expired, the request is rejected.

---

## 18. Current User

The backend provides an endpoint for retrieving the currently authenticated user's information:

```text
GET /api/auth/me
```

This endpoint requires authentication. It allows the frontend to obtain the current user's information and role, which is important when determining whether a user is a normal user or an administrator.

---

## 19. User Roles

The application uses roles to determine what users are allowed to access. The main roles are:

- `student`
- `admin`

A normal user (student) can use the normal Lost & Found functionality. An administrator has additional permissions.

---

## 20. Administrator Authorization

Administrator routes are protected. A user must be authenticated and have the role `admin` before accessing administrator-only functionality.

```text
Request
   |
   v
Check Authentication
   |
   v
Verify JWT
   |
   v
Check User Role
   |
   +---- Not admin ----> 403 Forbidden
   |
   v
Administrator
   |
   v
Allow Request
```

This prevents normal users from accessing administrator functions.

---

## 21. Items

The backend manages lost and found item records. Items can include:

- Item name
- Description
- Category
- Location
- Date
- Type
- Status
- User who reported the item

The frontend sends item information to the backend. The backend stores the information in MySQL.

---

## 22. Items API

**Get Items**

```text
GET /api/items
```

Retrieves items.

**Get One Item**

```text
GET /api/items/:id
```

Retrieves information about a specific item.

**Create Item**

```text
POST /api/items
```

Creates a new item record. An authenticated user can use it to report an item.

**Update Item**

```text
PATCH /api/items/:id
```

Updates an existing item. Only the user who reported it, or an administrator, can update it.

---

## 23. Reporting a Lost Item

A user can report an item that they have lost. The lost item form may contain:

- Item Name
- Description
- Category
- Location
- Date Lost
- Additional Information

The frontend sends this information to `POST /api/items`. The backend receives the request and stores the information in the database.

```text
User
  |
  v
Lost Item Form
  |
  v
Frontend
  |
  v
POST /api/items
  |
  v
Backend
  |
  v
MySQL
  |
  v
Response
  |
  v
Frontend
```

---

## 24. Reporting a Found Item

Users can also report an item that they have found. A found item report may contain:

- Item Name
- Description
- Category
- Location
- Date Found
- Additional Information

The frontend sends the information to the backend. The backend processes the request and stores the information in the database.

---

## 25. Claims

The claims feature allows users to claim items that they believe belong to them. A user can submit a claim for an item. The backend stores the claim and associates it with the relevant user and item. An administrator can then review the claim.

---

## 26. Claims API

**Create Claim**

```text
POST /api/claims
```

Allows an authenticated user to submit a claim.

**My Claims**

```text
GET /api/claims/mine
```

Allows a user to view their own claims.

**All Claims**

```text
GET /api/claims
```

Protected by authentication and administrator authorization. Allows an administrator to view claims.

**Update Claim**

```text
PATCH /api/claims/:id
```

Allows an administrator to update a claim.

---

## 27. Claim Review

Administrators can review claims submitted by users. The administrator examines the claim information and makes a decision. A claim can be approved or rejected.

```text
User
  |
  v
Submit Claim
  |
  v
Backend
  |
  v
MySQL
  |
  v
Administrator
  |
  v
Review Claim
  |
  +---- Approve
  |
  +---- Reject
  |
  v
Update Claim
```

---

## 28. Notifications

The backend supports notifications, which communicate important information to users. Examples include:

- Claim approved
- Claim rejected
- Claim status changed
- Other system notifications

Notifications are stored and retrieved through the backend.

---

## 29. Notifications API

**Get Notifications**

```text
GET /api/notifications
```

Retrieves notifications for the authenticated user.

**Mark Notification as Read**

```text
PATCH /api/notifications/:id/read
```

Changes the notification's read status.

---

## 30. User Profiles

The backend provides functionality for managing user profile information. Authenticated users can update their own profile. The profile may contain:

- Name
- Phone
- Course
- Bio

The backend identifies the user using the authenticated user's ID.

---

## 31. Profile API

```text
PATCH /api/users/me
```

Allows an authenticated user to update their own profile. The backend ensures that the user can only update their own account information.

---

## 32. Administrator User Management

Administrators have additional functionality for managing users.

```text
GET /api/users/admin/list
```

Lists users. Requires administrator authorization.

```text
PATCH /api/users/admin/:id/role
```

Updates a user's role. This allows authorized administrators to change user roles.

---

## 33. API Structure

The backend API is divided into different areas:

```text
/api/auth
/api/items
/api/claims
/api/notifications
/api/users
```

Each area is responsible for a different part of the application.

---

## 34. Authentication Routes

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

- The register route creates an account.
- The login route authenticates the user.
- The `/me` route retrieves the authenticated user's information.

---

## 35. Item Routes

```text
GET    /api/items
GET    /api/items/:id
POST   /api/items
PATCH  /api/items/:id
```

These routes allow the system to retrieve, create, and update item records.

---

## 36. Claim Routes

```text
POST  /api/claims
GET   /api/claims/mine
GET   /api/claims
PATCH /api/claims/:id
```

Normal users can submit claims and view their own claims. Administrators can view and manage claims.

---

## 37. Notification Routes

```text
GET   /api/notifications
PATCH /api/notifications/:id/read
```

These routes allow users to retrieve and update their notifications.

---

## 38. User Routes

```text
PATCH /api/users/me
GET   /api/users/admin/list
PATCH /api/users/admin/:id/role
```

The first route allows users to update their own profile. The other routes are administrator functions.

---

## 39. HTTP Methods

**GET** is used to retrieve information.

```text
GET /api/items
GET /api/items/:id
GET /api/claims/mine
GET /api/notifications
```

**POST** is used to create new information.

```text
POST /api/auth/register
POST /api/auth/login
POST /api/items
POST /api/claims
```

**PATCH** is used to update existing information.

```text
PATCH /api/items/:id
PATCH /api/claims/:id
PATCH /api/notifications/:id/read
PATCH /api/users/me
PATCH /api/users/admin/:id/role
```

---

## 40. HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | The request was successfully completed. |
| 201 | Created | A new resource was successfully created. |
| 400 | Bad Request | The request contains invalid or missing information. |
| 401 | Unauthorized | The user is not authenticated or the token is invalid. |
| 403 | Forbidden | The user is authenticated but lacks permission. |
| 404 | Not Found | The requested resource could not be found. |
| 500 | Internal Server Error | An unexpected error occurred on the backend. |

---

## 41. Frontend and Backend Communication

The frontend communicates with the backend through HTTP requests. The frontend uses Axios to send requests to the backend API. The backend processes the requests and returns JSON responses.

```text
React Frontend
      |
      | HTTP Request
      v
Express Backend
      |
      | SQL Query
      v
MySQL Database
      |
      | Result
      v
Express Backend
      |
      | JSON Response
      v
React Frontend
```

---

## 42. API Base URL

During local development, the backend API is available at:

```text
http://localhost:5001/api
```

The frontend uses the environment variable `VITE_API_URL` (set in `frontend/.env`):

```env
VITE_API_URL=http://127.0.0.1:5001/api
```

If `VITE_API_URL` is not configured, the frontend uses the local backend address. After changing `frontend/.env`, restart the frontend with `npm run dev`.

---

## 43. Authorization Header

Authenticated frontend requests include the JWT token in the Authorization header:

```text
Authorization: Bearer TOKEN
```

The backend reads the token and verifies it. If the token is valid, the request continues. If it is missing or invalid, the backend returns an authentication error.

---

## 44. CORS

CORS means Cross-Origin Resource Sharing. The frontend and backend run on different ports:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:5001
```

Because the ports are different, they are considered different origins. The CORS configuration allows the frontend to communicate with the backend.

---

## 45. Error Handling

The backend provides error responses when requests cannot be completed. Examples include:

- Please sign in.
- Administrator access required.
- Session expired. Sign in again.

The frontend uses these responses to display appropriate messages to the user.

---

## 46. Security

The backend protects user and application data through authentication and authorization. Important security measures include:

- Password hashing
- JWT authentication
- Protected API routes
- Administrator authorization
- Environment variables
- Database access control
- Input validation
- Error handling

---

## 47. Password Security

Passwords are never stored as plain text. They are hashed before being stored in the database. When a user logs in, the backend compares the supplied password against the stored password hash. This protects users' passwords if the database is accessed without authorization.

---

## 48. Protected Routes

Some routes require authentication, for example:

```text
GET   /api/auth/me
POST  /api/items
POST  /api/claims
GET   /api/claims/mine
GET   /api/notifications
PATCH /api/users/me
```

These routes require a valid authentication token.

---

## 49. Administrator Protected Routes

Some routes require administrator access:

```text
GET   /api/claims
PATCH /api/claims/:id
GET   /api/users/admin/list
PATCH /api/users/admin/:id/role
```

These routes require:

1. A valid JWT.
2. An authenticated user.
3. The `admin` role.

---

## 50. Testing the Backend

The backend should be tested before being considered complete. Testing should include:

- Registration
- Login
- Authentication
- User profile updates
- Lost item reporting
- Found item reporting
- Item retrieval
- Claim submission
- Claim review
- Notifications
- Administrator access
- User management

The application should also be tested from the frontend to make sure the frontend and backend communicate correctly.

---

## 51. Testing Authentication

Authentication testing should verify that:

- A user can register.
- A registered user can log in.
- Incorrect credentials are rejected.
- A valid JWT allows protected requests.
- An invalid JWT is rejected.
- An expired session is rejected.
- Normal users cannot access administrator routes.
- Administrators can access administrator routes.

---

## 52. Testing Administrator Access

Administrator access should be tested using different account roles. A normal user should receive a forbidden response when attempting to access an administrator-only endpoint. An administrator should be allowed to access those endpoints.

The important role value is `admin`. To make a user an administrator:

```sql
UPDATE ucu_lost_found.users SET role='admin' WHERE email='your@email.com';
```

If a user's role is changed in the database, the user must log in again so that the new role is reflected in the authentication token.

---

## 53. Troubleshooting the Backend

**Backend does not start.** First check Node.js:

```powershell
node --version
```

Then check npm:

```powershell
npm --version
```

Install dependencies:

```powershell
npm install
```

Then start the backend:

```powershell
npm start
```

---

## 54. Port 5001 Already in Use

If the backend displays an error saying that port 5001 is already in use, another process may already be running on that port. Check the port:

```powershell
netstat -ano | findstr :5001
```

If the backend is already running, do not start another copy.

---

## 55. Database Connection Problems

If the backend cannot connect to MySQL, check:

- MySQL is running.
- The database exists.
- `DB_HOST` is correct.
- `DB_USER` is correct.
- `DB_PASSWORD` is correct.
- `DB_NAME` is correct.

The health page `http://localhost:5001/api/health` shows the reason. For example, `Unknown database 'ucu_lost_found'` means `schema.sql` has not been run yet.

---

## 56. Login Problems

If login does not work, check:

- The user exists in the database.
- The email address is correct.
- The password is correct.
- The backend is running.
- The frontend is using the correct API URL.
- The JWT secret is configured.
- The database connection is working.

If the frontend shows "Cannot reach API", the browser could not contact the backend at all. Check that the backend is running and that `VITE_API_URL` in `frontend/.env` matches the backend port, then restart the frontend.

---

## 57. Administrator Problems

If administrator functionality does not appear or does not work, check the user's role in the database. The administrator account should have `role = admin`. The user should then log out and log in again so that the authentication information reflects the updated role.

---

## 58. Development Workflow

```text
Open Project
     |
     v
Open Backend Folder
     |
     v
Install Dependencies
     |
     v
Configure Environment
     |
     v
Start MySQL
     |
     v
Start Backend
     |
     v
Test API
     |
     v
Connect Frontend
     |
     v
Test Complete System
```

---

## 59. Common Backend Commands

Navigate to the backend:

```powershell
cd "C:\Users\LEN\Downloads\lost-and-found-main\lost-and-found-main\backend"
```

Install dependencies:

```powershell
npm install
```

Start the backend:

```powershell
npm start
```

Check Node.js and npm:

```powershell
node --version
npm --version
```

Check Git status:

```powershell
git status
```

---

## 60. Git and Version Control

Git is used to track changes to the project. Before making a commit, check the current status:

```powershell
git status
```

Review changes:

```powershell
git diff
```

Add the required files:

```powershell
git add .
```

Create a commit:

```powershell
git commit -m "your commit message"
```

Pull other people's changes, then push yours:

```powershell
git pull origin main
git push
```

When working as a group, avoid force pushing because it can overwrite other group members' work.

---

## 61. Backend Development Guidelines

When developing the backend:

- Understand the existing code before making changes.
- Keep existing functionality working.
- Test database operations.
- Test authentication.
- Test administrator authorization.
- Test API endpoints.
- Handle errors properly.
- Keep passwords and secrets out of source code.
- Do not commit `.env` files containing secrets.
- Use clear Git commit messages.
- Test changes before pushing them.
- Avoid overwriting other group members' work.

---

## 62. Complete API Reference

```text
AUTHENTICATION

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me


ITEMS

GET    /api/items
GET    /api/items/:id
POST   /api/items
PATCH  /api/items/:id


CLAIMS

POST   /api/claims
GET    /api/claims/mine
GET    /api/claims
PATCH  /api/claims/:id


NOTIFICATIONS

GET    /api/notifications
PATCH  /api/notifications/:id/read


USERS

PATCH  /api/users/me
GET    /api/users/admin/list
PATCH  /api/users/admin/:id/role


SYSTEM

GET    /api/health
```

---

## 63. Public and Protected Routes

Not every API route requires the same level of access. Some routes are public, some require authentication, and some require administrator authorization.

```text
Public Route
     |
     v
Anyone can access


Authenticated Route
     |
     v
Valid JWT Required


Administrator Route
     |
     v
Valid JWT
     +
Admin Role Required
```

---

## 64. Complete Lost & Found Workflow

```text
User Registers
      |
      v
User Logs In
      |
      v
Backend Authenticates User
      |
      v
JWT Token Returned
      |
      v
User Accesses Dashboard
      |
      v
User Reports Lost/Found Item
      |
      v
Backend Stores Item
      |
      v
Another User Finds Relevant Item
      |
      v
User Submits Claim
      |
      v
Backend Stores Claim
      |
      v
Administrator Reviews Claim
      |
      v
Administrator Approves or Rejects
      |
      v
Claim Status Updated
      |
      v
Notification Sent/Displayed
      |
      v
Lost & Found Process Completed
```

---

## 65. Administrator Workflow

```text
Administrator Logs In
        |
        v
Backend Verifies JWT
        |
        v
Backend Checks Admin Role
        |
        v
Administrator Dashboard
        |
        +---- View Claims
        |
        +---- Review Claims
        |
        +---- Approve Claims
        |
        +---- Reject Claims
        |
        +---- Manage Users
        |
        +---- Manage User Roles
        |
        v
Database Updated
```

---

## 66. User Workflow

```text
Register
   |
   v
Login
   |
   v
Dashboard
   |
   +---- Browse Items
   |
   +---- Search Items
   |
   +---- Report Lost Item
   |
   +---- Report Found Item
   |
   +---- Submit Claim
   |
   +---- View My Claims
   |
   +---- View Notifications
   |
   +---- Update Profile
```

---

## 67. Backend Responsibilities Summary

**Authentication:** registration, login, JWT generation, token verification, current user information.

**Users:** user profiles, user roles, administrator user management.

**Items:** lost item reports, found item reports, item retrieval, item updates.

**Claims:** claim creation, retrieval, review, approval, rejection.

**Notifications:** notification retrieval, notification status updates.

**Security:** authentication, authorization, password protection, protected routes, administrator restrictions.

**Database:** user data, item data, claim data, notification data.

---

## 68. Why the Backend Is Important

The backend is an important part of the UCU Lost & Found system because it provides the services required by the frontend. Without the backend, the frontend would not have a central service for:

- Storing information
- Retrieving information
- Authenticating users
- Managing claims
- Managing users
- Controlling administrator access
- Communicating with MySQL

The backend therefore provides the main server-side foundation of the system.

---

## 69. Backend and Frontend Relationship

The frontend is responsible mainly for:

- User interface
- Forms
- Navigation
- Displaying data
- User interaction

The backend is responsible mainly for:

- API requests
- Authentication
- Authorization
- Business logic
- Database operations
- Data validation
- Security

The database is responsible for storing persistent application data. Together they form the complete UCU Lost & Found application.

---

## 70. Example: Reporting a Lost Item

A user reports a lost phone. The user enters:

```text
Item:        Phone
Description: Black smartphone
Location:    University Library
Date:        Date the phone was lost
```

1. The frontend sends the information to `POST /api/items`.
2. The backend verifies the user's authentication.
3. The backend processes the item information.
4. The backend stores the item in MySQL.
5. The backend sends a response to the frontend.
6. The frontend displays the appropriate result to the user.

---

## 71. Example: Submitting a Claim

A user sees an item that appears to belong to them and submits a claim.

```text
User
 |
 v
Select Item
 |
 v
Submit Claim
 |
 v
POST /api/claims
 |
 v
Backend
 |
 v
Database
 |
 v
Claim Stored
 |
 v
Administrator Reviews Claim
```

The administrator can then update the claim.

---

## 72. Example: Administrator Approves a Claim

An administrator reviews a claim and decides that the claim is valid. The administrator selects approve, and the frontend sends:

```text
PATCH /api/claims/:id
```

The backend checks:

1. Is the user authenticated?
2. Is the user an administrator?

If both checks pass, the backend updates the claim. The updated information is stored in MySQL, and the frontend can then display the updated claim status.

---

## 73. Example: Administrator Rejects a Claim

If an administrator determines that a claim is not valid, the claim can be rejected. The backend updates the claim information, and the user can then see the updated claim status through the frontend.

---

## 74. Backend Error Prevention

The backend validates requests before performing database operations. For example, it checks that required information exists before attempting to create a record. This helps prevent invalid or incomplete data from being stored. The backend also handles database errors and returns appropriate responses.

---

## 75. Backend Security Model

```text
             REQUEST
                |
                v
        Is authentication
           required?
          /          \
        No            Yes
        |              |
        v              v
      Route       Check JWT
                       |
                 Valid token?
                  /       \
                No         Yes
                |           |
                v           v
             401        Check role
                            |
                     Admin required?
                       /        \
                     No          Yes
                     |            |
                     v            v
                  User Route   Check admin
                                  |
                              Admin?
                             /     \
                           No       Yes
                           |         |
                           v         v
                          403      Route
```

---

## 76. Deployment Considerations

For development, the backend runs locally at `http://localhost:5001/api`. In a production environment, the backend would normally be hosted on a server, and the frontend would use the production API URL instead of the local development URL. Environment variables should be used to configure production settings.

---

## 77. Maintenance

The backend should be maintained as the application grows. Maintenance activities may include:

- Updating dependencies
- Fixing bugs
- Improving security
- Improving database performance
- Adding new API endpoints
- Improving validation
- Improving error handling
- Updating documentation

Changes should be tested before being merged into the main project.

---

## 78. Conclusion

The UCU Lost & Found Backend is the server-side foundation of the UCU Lost & Found application. It provides the API that connects the frontend application to the MySQL database.

The backend handles:

- User registration
- User login
- Authentication
- User profiles
- Lost item reports
- Found item reports
- Item management
- Claims
- Claim review
- Notifications
- Administrator functions
- User management
- Role-based authorization
- Database communication

The backend uses Node.js and Express to provide the API, MySQL to store application data, JWT to authenticate users, and middleware to protect restricted functionality.

The complete application works by allowing users to interact with the frontend while the backend processes their requests and communicates with the database.