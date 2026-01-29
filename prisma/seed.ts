import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// 1. Create a PostgreSQL connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Create the adapter
const adapter = new PrismaPg(pool);

// 3. Initialize the client with the adapter (Prisma 7 Style)
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  const jermaine = await prisma.barber.upsert({
    where: { id: "jermaine-1" },
    update: {},
    create: {
      id: "jermaine-1",
      name: "Jermaine Harris",
      bio: "Master Barber specializing in classic fades.",
    },
  });

  await prisma.service.createMany({
    data: [
      { name: "Adult Cut", price: 3000, duration: 30 },
      { name: "Kids Cut", price: 2000, duration: 25 },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seeding complete: Jermaine is in the building!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Don't forget to close the pool!
  });
