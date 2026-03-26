const mongoose = require("mongoose");

/**
 * Cached connection for serverless environments (Vercel).
 * Prevents opening a new connection on every invocation.
 */
let cachedConnection = null;

const connectDB = async () => {
  // Check if we already have a valid cached connection
  if (cachedConnection) {
    const state = mongoose.connection.readyState;
    console.log(`[DB] Current connection state: ${state}`);
    
    if (state === 1) {
      console.log(`[DB] Using existing connection`);
      return cachedConnection;
    }
    
    // If state is not 1, reset the cache and try again
    console.log(`[DB] Connection state is ${state}, attempting reconnect...`);
    cachedConnection = null;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    console.log("[DB] Connecting to MongoDB Atlas...");
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Optimized for serverless
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 10000,
      retryWrites: true,
      connectTimeoutMS: 10000,
    });

    cachedConnection = conn;
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
    console.log(`[DB] Database: ${conn.connection.db.name}`);
    console.log(`[DB] Connection state: ${mongoose.connection.readyState}`);
    return conn;
  } catch (error) {
    console.error(`[DB] Connection error: ${error.message}`);
    console.error(`[DB] Error name: ${error.name}`);
    cachedConnection = null;
    throw error;
  }
};

module.exports = connectDB;
