# Development & Folder Guide

## Architecture Pattern

We use a **Modular Controller-Service Pattern**. This separates the "How the API works" (Routes/Controllers) from "How the Business works" (Services).

### Folder Responsibilities

#### 1. Routes (`src/routes/`)

Defines the entry points for our API. No logic happens here; it simply maps URLs to Controllers.
_Example:_ `router.post('/bookings', BookingController.create);`

#### 2. Controllers (`src/controllers/`)

Controllers handle the "HTTP layer." They extract data from the request (`req.body`) and send back the appropriate status codes (`200`, `409`, `500`).

#### 3. Services (`src/services/`)

**The Brain of the App.** This is where the most important backend code lives. The service layer talks to the Database via Prisma.
_Example:_ A `BookingService` will check if a barber is available before allowing a new appointment to be saved.

#### 4. Middleware (`src/middleware/`)

Functions that run before the controller. We use these for:

- **Authentication**: Checking if a user is logged in.
- **Validation**: Using Zod to ensure the incoming data is correct.

#### 5. Config (`src/config/`)

Centralized place for library setups, such as our Prisma Client instance or Cloudinary for image uploads.

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL

### Setup Steps

1. Clone the repo: `git clone <your-url>`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

The server will be available at `http://localhost:3000`.

### 1/27/2026: setting up our backend database

We use Prisma as our ORM (Object-Relational Mapper). This allows us to define our database structure in a human-readable format and automatically sync it with PostgreSQL using migrations. This ensures our backend code always knows exactly what our data looks like.

## Infrastructure: Local PostgreSQL Management

I chose to manage a local PostgreSQL instance to gain a deeper understanding of database administration.

### Key Learnings:

- **Port Management:** Configured the database to run on the default port `5432`.
- **User Roles:** Managed superuser permissions and created project-specific databases.
- **Connection Strings:** Learned how to construct and secure connection strings using environment variables (`.env`) to prevent sensitive data from being committed to version control.

### Database Management Tools

- **pgAdmin 4**: Utilized as the primary Graphical User Interface (GUI) for monitoring local PostgreSQL health, managing backups, and visualizing table relationships.
- **Prisma Studio**: Used for quick data entry and viewing models in a web-based environment.

### Success Milestone: The "Full-Stack Handshake"

- **Status:** Complete ✅
- **Verification:** - Express server listens on Port 3000.
  - PostgreSQL Pool verifies connection on startup via `SELECT NOW()`.
  - API endpoint `/api/barbers` successfully queries the database using the Prisma Driver Adapter.
- **Outcome:** Database data is now visible in the browser as a JSON response.

### API Documentation: Current Endpoints

| Method | Endpoint        | Description              | Data Source     |
| :----- | :-------------- | :----------------------- | :-------------- |
| GET    | `/`             | Health Check             | Static String   |
| GET    | `/api/barbers`  | List of all barbers      | `Barber` table  |
| GET    | `/api/services` | Available haircuts/trims | `Service` table |

**Note:** All data is returned in JSON format. Error handling returns a `500` status code if the database connection fails.

### Milestone: Implementing Relational Logic

- **Concept:** Enforcing Data Integrity.
- **The Lesson:** In this schema, `Appointment` is a 'junction' table. It requires valid Foreign Keys from `User`, `Barber`, and `Service` to exist.
- **Implementation:** Added `POST /api/users` to allow creation of the 'Client' entity required for the appointment 'userId' field.
- **Status Codes:** - `201 Created`: Standard for successful resource creation.
  - `409 Conflict`: Used specifically for unique email violations.

### Milestone: Verified Relational Integrity & Constraints

- **Success:** Successfully linked four different tables (User, Barber, Service, Appointment) in a single transaction.
- **Validation:** Confirmed that `serviceId` and `barberId` must be valid UUIDs existing in the database for the appointment to save.
- **Constraint Testing:** Verified the `@@unique([barberId, startTime])` constraint. The system successfully rejects overlapping appointments for the same barber, preventing scheduling errors.

### Debugging: 500 Internal Server Error (Foreign Keys)

- **Issue:** Appointment creation failed with a generic 'Could not complete booking' error.
- **Cause:** Foreign Key Violation. The `serviceId` or `barberId` provided in the JSON body did not exist in the database.
- **Resolution:** 1. Queried the `/api/services` and `/api/barbers` endpoints to retrieve valid UUIDs. 2. Updated the Postman request body with existing record IDs.
- **Lesson:** Relational databases enforce 'Referential Integrity'—you cannot create a child record (Appointment) that points to a non-existent parent (Service/Barber).

### Concept: UUID (Universally Unique Identifier)

- **What it is:** The long strings like `0d8522f8...` are UUIDs generated by PostgreSQL/Prisma.
- **Why we use them:** They are virtually impossible to guess, making the API more secure than using simple numbers like `1, 2, 3`.
- **Relationship:** In the URL `api/appointments/:id`, the `:id` is a placeholder for this UUID. The server uses this 'key' to find the exact row in the database.

### Milestone: Backend API Feature Freeze

- **CRUD Operations:** Verified all endpoints (Create, Read, Update, Delete) are functional using Postman.
- **Database Logic:** Verified that Prisma and PostgreSQL correctly handle relational data and unique constraints.
- **Error Handling:** Implemented custom error messages for 404 (Not Found) and 500 (Server Error) scenarios.
- **Next Phase:** Frontend Integration — Connecting a user interface to these API endpoints.
