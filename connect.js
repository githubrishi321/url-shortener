const mongoose = require('mongoose');
mongoose.set("strictQuery", true);

async function connectToMongoDB(url) {
  try {
    const mongoURL = url || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/short-url";
    await mongoose.connect(mongoURL);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}

module.exports = { connectToMongoDB };
