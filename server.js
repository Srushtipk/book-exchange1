import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/auth.js";
import booksRoutes from "./routes/books.js";
import requestsRoutes from "./routes/requests.js";
import dashboardRoutes from "./routes/dashboard.js";

// Load environment variables
dotenv.config();

// Destructure and validate critical env vars
const { MONGO_URI, JWT_SECRET, PORT = 4000 } = process.env;
if (!MONGO_URI) {
  console.error("❌ Error: MONGO_URI is not set in your .env");
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error("❌ Error: JWT_SECRET is not set in your .env");
  process.exit(1);
}

const app = express();

// CORS setup (no cookies needed for JWT)
app.use(
  cors({
    origin: true,
  })
);

app.use(express.json());

// JWT auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Missing Authorization header" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: "Invalid or expired token" });
    req.userId = payload.id;
    next();
  });
}

// Public auth routes
app.use("/auth", authRoutes);

// Protected routes
app.use("/books", authenticateToken, booksRoutes);
app.use("/requests", authenticateToken, requestsRoutes);
app.use("/dashboard", authenticateToken, dashboardRoutes);

// Connect to MongoDB and start the server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });
