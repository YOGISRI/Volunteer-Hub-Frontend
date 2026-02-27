import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import opportunitiesRoutes from "./routes/opportunitiesRoutes.js";
import users from "./routes/users.js";
import  supabase from "./config/supabaseClient.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/opportunities", opportunitiesRoutes);
app.use("/api/users", users);

// Health check
app.get("/", (req, res) => {
  res.send("Volunteer Hub API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});