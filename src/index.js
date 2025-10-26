// src/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { initMongoConnection } from "./db/initMongoConnection.js";
import contactsRouter from "./routes/contacts.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - SIRA ÖNEMLİ!
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Ana route kontrolü
app.get("/", (req, res) => {
  res.json({ message: "Contact API is running" });
});

// Routes - /contacts rotası için
app.use("/contacts", contactsRouter);

// Not found & error handlers - EN SONDA OLMALI
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await initMongoConnection();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Access contacts at http://localhost:${PORT}/contacts`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();