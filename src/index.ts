import express, { Request, Response } from "express";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Basic Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.send("💈 Barbershop Near Me API is Running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is sparking up at http://localhost:${PORT}`);
});
