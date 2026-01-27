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
