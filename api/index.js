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
  if (!isConnected) {
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
