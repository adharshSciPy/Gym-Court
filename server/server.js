import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./mongoDB/mongodb.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json()); // for parsing JSON bodies
app.use(cors());

// Routes
app.get("/", (req, res) => {
    res.send("API is running...");
});


// Server listen
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`✅ Server running in port ${PORT}`);
});
