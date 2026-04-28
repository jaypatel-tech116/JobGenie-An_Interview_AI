const mongoose = require("mongoose");

async function connectToDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);

    // Stop app if DB fails
    process.exit(1);
  }
}

module.exports = connectToDB;
