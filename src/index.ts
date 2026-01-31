import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 1. Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Initialize PostgreSQL Connection Pool
// This keeps a steady 'bridge' open to your database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Add a listener to catch hidden database errors
pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err);
});

// 3. Initialize Prisma 7 with the Adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 4. Middleware
app.use(express.json());

// --- ROUTES ---

// Health Check (Check if server is alive)
app.get("/", (req: Request, res: Response) => {
  res.send("💈 Barbershop Near Me API is officially online!");
});

// GET: All Barbers
app.get("/api/barbers", async (req: Request, res: Response) => {
  try {
    const barbers = await prisma.barber.findMany();
    res.json(barbers);
  } catch (error) {
    console.error("Error fetching barbers:", error);
    res.status(500).json({ error: "Failed to load barbers" });
  }
});

// POST: Create a new Barber
app.post("/api/barbers", async (req: Request, res: Response) => {
  try {
    const { name, bio, imageUrl } = req.body;

    if (!name || !bio) {
      return res.status(400).json({ error: "Name and bio are required" });
    }

    const newBarber = await prisma.barber.create({
      data: {
        name,
        bio,
        imageUrl,
      },
    });

    res.status(201).json(newBarber);
  } catch (error) {
    console.error("Barber Creation Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET: A single barber by ID (Cleaner Version)
app.get("/api/barbers/:id", async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId; // normalize id to string | undefined

    if (!id) {
      return res.status(400).json({ error: "Invalid barber id" });
    }

    // If 'id' is our variable name and also the database field name,
    // we can just use shorthand: { id }
    const barber = await prisma.barber.findUnique({
      where: { id: id as string },
    });

    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    res.json(barber);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET: All Services (Prices and Durations)
app.get("/api/services", async (req: Request, res: Response) => {
  try {
    // .findMany() fetches every row from the 'Service' table
    const services = await prisma.service.findMany({
      orderBy: { price: "asc" }, // Optional: Sort by cheapest first
    });
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to load services" });
  }
});

// POST: Create a new User (Registration)
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role || "CLIENT", // Default to CLIENT if role isn't provided
      },
    });

    res.status(201).json(newUser);
  } catch (error: any) {
    console.error("User Creation Error:", error);

    // Check if the email already exists (P2002 is Prisma's Unique constraint code)
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "A user with this email already exists" });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/appointments", async (req: Request, res: Response) => {
  try {
    const { barberId, serviceId, userId, startTime, endTime } = req.body;

    // 1. Validation based on YOUR schema fields
    if (!barberId || !serviceId || !userId || !startTime || !endTime) {
      return res.status(400).json({
        error:
          "Missing required booking details (barberId, serviceId, userId, startTime, endTime)",
      });
    }

    // 2. Creating the appointment
    const appointment = await prisma.appointment.create({
      data: {
        barberId,
        serviceId,
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        // status defaults to PENDING automatically based on your schema!
      },
    });

    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment,
    });
  } catch (error: any) {
    console.error("Booking Error:", error);

    // 3. Handling your "Secret Sauce" unique constraint error
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "This barber is already booked for this time slot!" });
    }

    res.status(500).json({ error: "Could not complete booking" });
  }
});

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401); // No token, no entry

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) return res.sendStatus(403); // Bad token
    req.user = user;
    next();
  });
};

// Update your DELETE route to use the middleware
app.delete("/api/appointments/:id", authenticateToken, async (req, res) => {
  // ... your existing delete code ...
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      return res.status(400).json({ error: "Invalid appointment id" });
    }

    const deletedAppointment = await prisma.appointment.delete({
      where: { id },
    });

    res.json({
      message: "Appointment cancelled successfully",
      deletedAppointment,
    });
  } catch (error: any) {
    console.error("Delete Error:", error);

    // Prisma error code for 'Record not found'
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(500).json({ error: "Could not cancel appointment" });
  }
});

// PUT: Update an appointment time
app.put("/api/appointments/:id", async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { startTime, endTime } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Invalid appointment id" });
    }

    if (!startTime || !endTime) {
      return res
        .status(400)
        .json({ error: "New start and end times are required" });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: id as string },
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    res.json({
      message: "Appointment rescheduled successfully!",
      updatedAppointment,
    });
  } catch (error: any) {
    console.error("Update Error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(500).json({ error: "Could not update appointment" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email } = req.body; // In a real app, you'd check a password too!

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(401).json({ error: "Invalid email" });

  // Generate a token that lasts 24 hours
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });

  res.json({ token, user });
});

// 5. Server Startup Logic
// We wrap this in an async function to ensure the database is ready
const startServer = async () => {
  try {
    // Attempt to ping the database once before starting Express
    await pool.query("SELECT NOW()");
    console.log("🐘 Database connection verified.");

    app.listen(PORT, () => {
      console.log(`\n🚀 SERVER STARTED`);
      console.log(`🔗 Local:   http://localhost:${PORT}`);
      console.log(`📡 API:     http://localhost:${PORT}/api/barbers`);
      console.log(`\nPress CTRL+C to stop.`);
    });
  } catch (error) {
    console.error("❌ Critical Startup Error:", error);
    process.exit(1);
  }
};

startServer();
