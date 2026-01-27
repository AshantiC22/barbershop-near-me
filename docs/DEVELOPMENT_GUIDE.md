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
