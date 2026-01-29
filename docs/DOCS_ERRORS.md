# Developer Troubleshooting & Log

### [2026-01-27] Prisma 7.3.0 Environment Setup

**Goal:** Initialize local PostgreSQL and seed initial data.
**Environment:** Node.js v25, Prisma 7.3.0

| Issue                        | Resolution                                                             |
| :--------------------------- | :--------------------------------------------------------------------- |
| `schema.prisma` URL Error    | Moved connection strings to `prisma.config.ts` (Prisma 7 requirement). |
| Missing `@prisma/config`     | Corrected import syntax to use @scope.                                 |
| Client Module Not Found      | Ran `npx prisma generate` to sync local SDK with schema.               |
| Constructor Validation Error | Passed `datasources` object explicitly to `PrismaClient` in `seed.ts`. |

**Lesson:** In Prisma 7, the "Lean Client" doesn't auto-load env variables for seeds. Always pass the DB URL manually in scripts.

### API Logic: Data Normalization & Type Safety

- **Problem:** Route parameters (`req.params.id`) can occasionally be interpreted as arrays or complex objects depending on the request structure.
- **The "Defensive" Fix:** Implemented a ternary check to normalize the ID:
  `const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;`
- **Benefit:** This ensures the `prisma.findUnique` query never crashes due to a type mismatch (Prisma expects a `string`, not a `string[]`).
- **Validation:** Added a `400 Bad Request` check to stop the process early if the ID is missing or undefined.
