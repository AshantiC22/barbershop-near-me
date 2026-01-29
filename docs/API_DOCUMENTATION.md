# API Documentation: Barbershop Near Me

## 1. Overview

The "Barbershop Near Me" API is a RESTful service designed to manage client bookings, barber schedules, and service listings. This API follows a standard request-response pattern using JSON.

- **Base URL:** `https://api.barbershop-near-me.com/v1`
- **Content-Type:** `application/json`
- **Versioning:** v1

## 2. Authentication

Secure endpoints require a JSON Web Token (JWT) passed in the authorization header.
`Authorization: Bearer <JWT_TOKEN>`

---

## 3. Endpoints

### A. Barbers & Services

Endpoints for discovering professionals and their offerings.

#### `GET /barbers`

Returns a list of all active barbers in the system.

- **Response (200 OK):**
  ```json
  [
    {
      "id": "uuid",
      "name": "John Doe",
      "specialty": "Fades & Tapers",
      "imageUrl": "[https://cdn.example.com/barber1.jpg](https://cdn.example.com/barber1.jpg)"
    }
  ]
  ```

---

To make sure your docs/API_DOCUMENTATION.md is fully professional and ready for your repository, here is the complete content in a clean, copy-pasteable Markdown block.

I have organized this so it's easy for a recruiter to skim while demonstrating that you understand REST principles, HTTP status codes, and data validation.

Markdown

# API Documentation: Barbershop Near Me

## 1. Overview

The "Barbershop Near Me" API is a RESTful service designed to manage client bookings, barber schedules, and service listings. This API follows a standard request-response pattern using JSON.

- **Base URL:** `https://api.barbershop-near-me.com/v1`
- **Content-Type:** `application/json`
- **Versioning:** v1

## 2. Authentication

Secure endpoints require a JSON Web Token (JWT) passed in the authorization header.
`Authorization: Bearer <JWT_TOKEN>`

---

## 3. Endpoints

### A. Barbers & Services

Endpoints for discovering professionals and their offerings.

#### `GET /barbers`

Returns a list of all active barbers in the system.

- **Response (200 OK):**
  ```json
  [
    {
      "id": "uuid",
      "name": "John Doe",
      "specialty": "Fades & Tapers",
      "imageUrl": "[https://cdn.example.com/barber1.jpg](https://cdn.example.com/barber1.jpg)"
    }
  ]
  ```

## GET /services

    Returns the menu of available services (e.g., Haircut, Beard Trim).

    Response (200 OK):
    [
        { "id": "uuid", "name": "Classic Fade", "price": 3000, "duration": 30 }
    ]

### Availability & Bookings

    The core engine of the application handling time-slot logic.

### GET /availability

    Fetches free time slots for a specific barber on a chosen date.

    *Query Params: barberId (string), date (ISO string)

    *Logic: The server calculates "Free" slots by cross-referencing the Barber's working hours against the Appointment table for that specific date.

    *Example Request: /v1/availability?barberId=123&date=2026-02-15

### POST /bookings

    Creates a new appointment in the database.

    Request Body:
    {
        "barberId": "uuid",
        "serviceId": "uuid",
        "startTime": "2026-02-15T14:00:00Z"
    }
    *Success (201 Created): Returns the confirmed booking object.

    *Error (409 Conflict): Triggered if the slot was booked by another user during the checkout process (Race Condition).

### Admin / Barber Dashboard

    Privileged endpoints requiring ADMIN or BARBER roles.

### GET /admin/schedule

    Retrieves all appointments for the authenticated barber for the current day.

    Response (200 OK): An array of appointment objects sorted chronologically.

    --PATCH /bookings/:id
    Updates the status of an existing booking.

    Request Body:
    {
        "status": "COMPLETED" | "CANCELLED"
    }

### Standard Error Codes

    The API uses consistent HTTP status codes to communicate errors clearly to the frontend.

    *400 | Bad Request| Data validation failed (e.g., malformed email or missing fields).
    *401 | Unauthorized| Bearer token is missing, invalid, or expired.
    *403 | Forbidden	| User lacks the necessary permissions (Role-based access control).
    *404 | Not Found	| The requested resource (Barber or Booking ID) does not exist.
    *409 | Conflict	| The time slot is already taken. Requires a re-fetch of availability.
    *500 | Server Error| An unhandled exception occurred on the backend.

### Search & Optimization

To support the "Near Me" feature and ensure high performance:

    *Geographic Filtering: GET /barbers?zipcode=90210 filters barbers by proximity.

    *Pagination: GET /barbers?page=1&limit=10 prevents large data transfers.

    *Search: GET /barbers?search=fade allows keyword searching through names and specialties.

### Milestone: Schema-Driven Development

- **The Issue:** Attempted to use `customerName` in code when the schema required a `userId`.
- **The Fix:** Synchronized the Express `req.body` to match the `Appointment` model fields: `userId`, `barberId`, `serviceId`, `startTime`, and `endTime`.
- **Database Logic:** - **Foreign Keys:** The appointment now correctly "points" to an existing User, Barber, and Service using their IDs.
  - **Double-Booking Protection:** Leveraged the `@@unique([barberId, startTime])` constraint.
- **Error Handling:** Added a check for Prisma error code `P2002` (Unique constraint failed) to tell the user the slot is taken.
