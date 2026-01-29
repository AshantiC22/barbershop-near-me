# 💈 Barbershop Booking API (Backend)

A production-ready RESTful API built with Node.js, Express, and PostgreSQL. Designed to handle user authentication and scheduling for a professional barbershop.

## 🛠 Tech Stack

- **Runtime:** Node.js / TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT) & BcryptJS
- **Testing:** Postman

## 🚀 Features & Implementation

### 1. Database Architecture

- Relational schema linking **Users**, **Barbers**, **Services**, and **Appointments**.
- Implemented **Unique Constraints** to prevent barber double-booking (`@@unique([barberId, startTime])`).

### 2. Full CRUD Lifecycle

- **Create:** Secure user registration and appointment booking.
- **Read:** Public endpoints for fetching barbers and available services.
- **Update:** Logic to reschedule existing appointments using URL parameters.
- **Delete:** Protected cancellation routes with referential integrity checks.

### 3. Security & Error Handling

- **Auth:** JWT-based authentication to protect destructive routes.
- **Middleware:** Custom `authenticateToken` layer for identity verification.
- **Validation:** Global error handling for 404 (Not Found) and 500 (Internal Server Error) status codes.

## 🧪 Testing

The API has been fully verified using a Postman Collection, ensuring all headers, bodies, and status codes (201, 400, 401, 404, 409, 500) return as expected.
