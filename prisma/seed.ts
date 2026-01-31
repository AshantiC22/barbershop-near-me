import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting detailed seed...");

  // 1. Seed Multiple Barbers using upsert so we don't get duplicates
  const barbersData = [
    {
      id: "jermaine-1",
      name: "Jermaine Harris",
      bio: "Master Barber with 10+ years experience in classic fades and straight-razor shaves.",
      imageUrl: "https://images.unsplash.com/photo-1503910368127-b44609ee5f81",
    },
    {
      id: "sarah-2",
      name: "Sarah 'The Blade' Miller",
      bio: "Precision specialist known for modern textured crops and creative line-ups.",
      imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70",
    },
    {
      id: "marcus-3",
      name: "Marcus Chen",
      bio: "Beard grooming expert and specialist in long-hair transitions.",
      imageUrl: "https://images.unsplash.com/photo-1621605815841-aa88c82b0248",
    },
  ];

  for (const barber of barbersData) {
    await prisma.barber.upsert({
      where: { id: barber.id },
      update: barber,
      create: barber,
    });
  }

  // 2. Seed a Full Service Menu
  const services = [
    { name: "Adult Cut", price: 3500, duration: 30 }, // $35.00
    { name: "Beard Trim & Shape", price: 2000, duration: 20 },
    { name: "The Executive (Cut + Shave)", price: 6500, duration: 60 },
    { name: "Kids Cut", price: 2500, duration: 25 },
    { name: "Hot Towel Shave", price: 3000, duration: 30 },
  ];

  // We use createMany for services because they don't have custom IDs
  await prisma.service.createMany({
    data: services,
    skipDuplicates: true,
  });

  console.log(
    "✅ Seeding complete: The shop is fully staffed and the menu is set!",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
