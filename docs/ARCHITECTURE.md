# System Architecture: Barbershop Near Me

## 1. Executive Summary

"Barbershop Near Me" is a full-stack web application designed to bridge the gap between local barbers and clients. The system prioritizes **data integrity** (preventing double-bookings) and **low-latency discovery** (finding shops quickly). This documentation serves as the blueprint for the foundational build.

## 2. The Tech Stack

| Layer          | Choice                | Rationale                                                                                                              |
| :------------- | :-------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Frontend**   | **Next.js 14+**       | Enables Server-Side Rendering (SSR) for SEO and high-performance client-side interactivity for the calendar.           |
| **Backend**    | **Node.js / Express** | Non-blocking I/O allows the server to handle multiple booking requests simultaneously without performance bottlenecks. |
| **Database**   | **PostgreSQL**        | A relational database is required to enforce strict relationships between Barbers, Services, and Time Slots.           |
| **ORM**        | **Prisma**            | Provides a type-safe interface to the database, ensuring that our backend code matches our database schema exactly.    |
| **Validation** | **Zod**               | Ensures that data entering the API (phone numbers, dates) is validated before reaching the database layer.             |

---

## 3. Detailed Component Breakdown

### A. The Request Flow (The Journey of a Booking)

1. **Client Tier:** The user selects a Barber and a 2:00 PM slot. The React frontend sends a `POST` request to `/api/bookings`.
2. **API Tier:** Express receives the request. It validates the user's session (Authentication) and the data format (Zod).
3. **Logic Tier (The "Brain"):** The server queries the database to see if an appointment already exists for that Barber at that specific time.
4. **Database Tier:** If the slot is free, a **Database Transaction** is opened. The booking is saved, and the slot is marked as "Unavailable."
5. **Response:** The server sends a `201 Created` status back to the user, triggering a UI success state.

### B. Data Modeling (Relational Logic)

We utilize a relational schema to handle the following connections:

- **One-to-Many:** One Barber has many Appointments.
- **Many-to-Many:** One Appointment can include multiple Services (e.g., "Haircut" + "Beard Trim").
- **One-to-One:** Each Appointment is linked to exactly one User account.

---

## 4. Technical Strategy for Key Features

### Concurrency & Race Conditions

**The Problem:** Two users click "Book" for the last 4:00 PM slot at the same time.
**The Solution:** I implement **Database Transactions**. By using atomic operations, the database "locks" the availability check until the first user's booking is finished, forcing the second user's request to wait and then fail gracefully with a "Slot no longer available" message.

### Timezone Handling

**The Problem:** The server is in Virginia (UTC), the Barber is in New York (EST), and the Client is traveling in California (PST).
**The Solution:** \* All timestamps are stored in the database in **UTC (ISO 8601)**.

- The Frontend converts UTC to the **Shop's Local Time** for display so the client always sees the barber's actual working hours regardless of where the client is located.

---

## 5. Security Architecture

- **Environment Variables:** Sensitive data (DB Strings, API Keys) are stored in `.env` and never committed to version control.
- **CORS Policy:** The API is configured to only accept requests from the official "Barbershop Near Me" frontend domain.
- **Input Sanitization:** All user inputs are stripped of malicious scripts to prevent Cross-Site Scripting (XSS) and SQL Injection.

---

## 6. Future Scalability Plan

- **Caching:** Implement **Redis** to store available time slots for 5 minutes, reducing redundant load on PostgreSQL.
- **Background Jobs:** Use a worker (like BullMQ) to send email/SMS reminders 24 hours before an appointment.
