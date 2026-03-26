/**
 * Vercel Serverless Entry Point
 *
 * This file is the single entry that Vercel invokes for every request.
 * It connects to MongoDB (with caching) and then delegates to the Express app.
 *
 * For local development, it also starts a standalone HTTP server.
 */
require("dotenv").config();

const app = require("../src/app");
const connectDB = require("../src/config/db");

// ─── Connect to MongoDB before handling requests ─────────
let isConnected = false;

const handler = async (req, res) => {
  // Log request IP and headers for debugging
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  const trueclientip = req.headers["cf-connecting-ip"] || "N/A";
  const xrealip = req.headers["x-real-ip"] || "N/A";
  
  console.log("[API] Incoming Request");
  console.log(`  IP (x-forwarded-for): ${ip}`);
  console.log(`  CF IP (cf-connecting-ip): ${trueclientip}`);
  console.log(`  Real IP (x-real-ip): ${xrealip}`);
  console.log(`  User-Agent: ${req.headers["user-agent"]}`);
  
  if (!isConnected) {
    console.log("[API] Connecting to MongoDB...");
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};

// ─── Local development server ────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 DevTracker API running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });
  });
}

// Export for Vercel
module.exports = handler;
