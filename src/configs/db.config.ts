import mongoose from "mongoose";
import config from "./env.config.js";

const dbConnection = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI!);

    // Proper connection verification
    console.log(
      `✅ MongoDB connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`,
    );

    // Graceful handling of connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Exit process on DB failure
  }
};

export default dbConnection;
