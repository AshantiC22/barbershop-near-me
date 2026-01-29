🛠 Backend Sprint 1: Error Log & Resolutions
Date: 2026-01-27

Goal: Initialize PostgreSQL and seed local data for the "Barbershop Near Me" project.

Tech Stack: Node.js v25, Prisma 7.3.0, PostgreSQL 16.

1. The Configuration Hurdle
   Error: Command failed: npx prisma migrate dev (due to missing url in schema).

Cause: Prisma 7 moved database connection URLs out of schema.prisma into a new file: prisma.config.ts.

Resolution: Created prisma.config.ts and used the @prisma/config package to handle the DATABASE_URL environment variable.

2. The Import Typo (Scoped Packages)
   Error: Cannot find module 'prisma/config'.

Cause: Prisma 7 uses scoped naming conventions.

Resolution: Updated the import statement to @prisma/config. This @ symbol is crucial as it points to the official Prisma organization scope in the npm registry.

3. The "Lean Client" Challenge (Seeding)
   Error: PrismaClientInitializationError: PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions.

Cause: In version 7, the PrismaClient is "leaner." It doesn't automatically look for your .env during the seed process like it used to.

Resolution: Modified prisma/seed.ts to explicitly pass the DATABASE_URL into the constructor using the datasources object.

### Debugging: The 404 'Not Found' Error

- **Issue:** Received a 404 status when trying to create a user in Postman.
- **Cause:** Method Mismatch. The API expected a `POST` request, but the client (Postman) sent a `GET` request.
- **Solution:** Switched the HTTP verb to `POST` in Postman to align with the Express route definition.
- **Lesson:** An endpoint is defined by both its URL _and_ its Method. `GET /api/users` and `POST /api/users` are two completely different doors to the server.
