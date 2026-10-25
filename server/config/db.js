const mongoose = require('mongoose');

/**
 * Connect to MongoDB Database
 * Reads MONGO_URI from environment variables.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // In production we would exit, but during initial dev we log clearly
    console.error('[MongoDB] Please ensure your MONGO_URI in server/.env is valid and active.');
  }
};

module.exports = connectDB;

