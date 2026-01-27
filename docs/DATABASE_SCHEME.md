# Database Schema: Barbershop Near Me

## 1. Overview

This project uses **PostgreSQL** as the primary relational database. We utilize **Prisma ORM** to manage migrations and ensure type-safety across the full stack. The schema is designed to handle high-concurrency booking requests while maintaining strict data integrity.

## 2. Entity Relationship Diagram (ERD)

The system is built around four core entities: **Users**, **Barbers**, **Services**, and **Appointments**.

## 3. Data Dictionary

### `User` Table

Stores authentication and profile data for both clients and (optionally) admins.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier for the user. |
| `email` | String | Unique email used for login and notifications. |
| `name` | String | User's full name. |
| `role` | Enum | `CLIENT` or `ADMIN`. |
| `createdAt` | DateTime | Timestamp of account creation. |

### `Barber` Table

Stores profile information for the service providers.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier for the barber. |
| `name` | String | Professional name. |
| `bio` | Text | Description of expertise. |
| `imageUrl` | String | Path to the barber's profile photo. |

### `Service` Table

The menu of options available for booking.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier. |
| `name` | String | e.g., "Skin Fade", "Beard Trim". |
| `price` | Integer | Stored in cents (e.g., 2500 for $25.00) to avoid floating-point errors. |
| `duration` | Integer | Estimated time in minutes. |

### `Appointment` Table (The Junction)

The core table that links all entities together.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier. |
| `startTime` | DateTime | The UTC timestamp of the appointment. |
| `endTime` | DateTime | Calculated based on service duration. |
| `status` | Enum | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`. |
| `userId` | UUID (FK) | Reference to the `User` who booked. |
| `barberId` | UUID (FK) | Reference to the `Barber` assigned. |
| `serviceId` | UUID (FK) | Reference to the `Service` being provided. |

---

## 4. Key Constraints & Business Logic

To protect the "Barbershop Near Me" platform from data corruption, the following rules are enforced at the database level:

1. **Unique Appointment Slots:** A `UNIQUE` constraint is placed on the combination of `barberId` and `startTime`. This prevents a barber from being booked twice for the same start time.
2. **Price Integrity:** Prices are stored as **Integers** (cents) to ensure mathematical accuracy during checkout/reporting.
3. **Cascading Deletes:** If a `User` account is deleted, their `Appointments` are handled according to privacy laws (either deleted or anonymized).

## 5. Indexes for Performance

To ensure the "Near Me" aspect remains fast as the database grows, we implement:

- **Index on `startTime`:** Speeds up queries when users browse for specific dates.
- **Index on `barberId`:** Optimizes the barber-specific dashboard views.
