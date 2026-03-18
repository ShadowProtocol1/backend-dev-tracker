const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const studyMaterialRoutes = require("./routes/studyMaterialRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { metricsMiddleware } = require("./middleware/metrics");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ─── Global Middleware ───────────────────────────────────

// Metrics middleware (track all requests)
app.use(metricsMiddleware);

// CORS — allow the frontend origin (handle both localhost and 127.0.0.1)
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files (for dashboard)
app.use(express.static(path.join(__dirname, "../public")));

// Rate limiting (per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests — please try again later" },
});
app.use("/api/", limiter);

// ─── Health check ────────────────────────────────────────
app.get("/api", (_req, res) => {
  res.json({
    success: true,
    message: "DevTracker API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── Dashboard Control Center ────────────────────────────
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/dashboard.html"));
});

// ─── Dashboard API Routes ───────────────────────────────
app.use("/api/dashboard", dashboardRoutes);

// ─── API Routes ──────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/study-materials", studyMaterialRoutes);
app.use("/api/achievements", achievementRoutes);

// ─── 404 handler ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global error handler (must be last) ─────────────────
app.use(errorHandler);

module.exports = app;
