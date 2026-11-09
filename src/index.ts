import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes";
import activityRoutes from "./routes/activityRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import vehicleRoutes from "./routes/vehicleRoutes";
import geofenceRoutes from "./routes/geofenceRoutes";

const app = express();

// http security headers
app.use(helmet());

// strict cors policy
const allowedOrigins = ["https://langkahhijau.unpad.ac.id"]; // GANTI KE URL YANG BENERNYA NANTI
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Diblokir oleh kebijakan CORS."));
      }
    },
    credentials: true,
  }),
);

// rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Terlalu banyak permintaan, silakan coba lagi nanti." },
});
app.use("/api/", globalLimiter);

// json body parser
app.use(express.json({ limit: "10kb" }));

// register al routes
app.use("/api/auth", authRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/geofence", geofenceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server LangkahHijau berjalan aman di port ${PORT}`);
});

