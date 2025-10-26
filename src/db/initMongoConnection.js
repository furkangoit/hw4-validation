// server.js - Backend entry point

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

// Load environment variables FIRST
dotenv.config();

// Log startup info
console.log("🚀 Starting Contact API...");
console.log("Node version:", process.version);
console.log("Environment:", process.env.NODE_ENV || "development");

// Import after dotenv
import { initMongoConnection } from "./src/db/initMongoConnection.js";
import contactsRouter from "./src/routes/contacts.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { notFoundHandler } from "./src/middlewares/notFoundHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Contact API is running",
    version: "1.0.0",
    endpoints: {
      contacts: "/contacts",
      healthCheck: "/health"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/contacts", contactsRouter);

// Error handling - MUST BE LAST
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    console.log("📦 Initializing Express app...");
    
    // MongoDB connection with timeout
    console.log("🔌 Connecting to MongoDB...");
    const connectTimeout = setTimeout(() => {
      console.error("❌ MongoDB connection timeout (30s)");
      process.exit(1);
    }, 30000);
    
    await initMongoConnection();
    clearTimeout(connectTimeout);
    console.log("✅ MongoDB connected successfully");
    
    // Start Express server
    console.log("🌐 Starting Express server...");
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("✅ Server running successfully!");
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/contacts`);
      console.log(`📍 Health: http://localhost:${PORT}/health`);
    });

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });
    
  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err);
  process.exit(1);
});

startServer();