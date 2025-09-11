import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./mongoDB/mongodb.js";
import courtRoutes from "./routes/courtRoute.js"
import adminRouter from "./routes/adminRoute.js";
import receptionistRouter from "./routes/receptionistRoute.js";
import slotRouter from "./routes/slotRoute.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json()); // for parsing JSON bodies
app.use(cors());

// Routes
app.use("/api/v1/Court", courtRoutes)

app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/receptionist', receptionistRouter)
app.use('/api/v1/slot', slotRouter)


// Server listen
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`✅ Server running in port ${PORT}`);
});
